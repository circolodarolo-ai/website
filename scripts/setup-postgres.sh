#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# setup-postgres.sh
#
# Script di setup completo per migrare il progetto da SQLite a PostgreSQL.
# Esegue: installazione PG → creazione DB → prisma push → migrazione dati
#
# Uso:  chmod +x scripts/setup-postgres.sh && bash scripts/setup-postgres.sh
# ═══════════════════════════════════════════════════════════════════════════

set -e

# ── Configurazione ──────────────────────────────────────────────────────
DB_NAME="ristorante_db"
DB_USER="postgres"
DB_PASS="postgres"

# Colori
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info()  { echo -e "${BLUE}ℹ ${NC}$1"; }
log_ok()    { echo -e "${GREEN}✅ ${NC}$1"; }
log_warn()  { echo -e "${YELLOW}⚠️  ${NC}$1"; }
log_err()   { echo -e "${RED}❌ ${NC}$1"; }

# ── Step 1: Verifica PostgreSQL ────────────────────────────────────────
echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  MIGRAZIONE RISTORANTE: SQLite → PostgreSQL"
echo "══════════════════════════════════════════════════════════════"
echo ""

log_info "Verifico che PostgreSQL sia installato..."
if ! command -v psql &> /dev/null; then
  log_err "PostgreSQL non trovato. Installalo prima:"
  echo ""
  echo "  macOS:   brew install postgresql@17 && brew services start postgresql@17"
  echo "  Ubuntu:  sudo apt install postgresql postgresql-contrib"
  echo "  Windows: scarica da https://www.postgresql.org/download/"
  echo ""
  exit 1
fi
log_ok "PostgreSQL trovato: $(psql --version)"

# ── Step 2: Verifica che il server sia attivo ──────────────────────────
log_info "Verifico che il server PostgreSQL sia in esecuzione..."
if ! pg_isready -h localhost -p 5432 &> /dev/null; then
  log_warn "PostgreSQL non è in esecuzione. Tentativo di avvio..."
  # macOS con brew
  if command -v brew &> /dev/null; then
    brew services start postgresql@17 2>/dev/null || brew services start postgresql 2>/dev/null || true
  # Linux systemd
  elif command -v sudo &> /dev/null; then
    sudo systemctl start postgresql 2>/dev/null || true
  fi
  sleep 2
  if pg_isready -h localhost -p 5432 &> /dev/null; then
    log_ok "PostgreSQL avviato con successo"
  else
    log_err "Impossibile avviare PostgreSQL. Avvialo manualmente e riprova."
    exit 1
  fi
else
  log_ok "PostgreSQL è in esecuzione"
fi

# ── Step 3: Chiedi credenziali ─────────────────────────────────────────
echo ""
echo -e "${BLUE}Configurazione database:${NC}"
read -p "  Nome utente PostgreSQL [${DB_USER}]: " INPUT_USER
DB_USER="${INPUT_USER:-$DB_USER}"
read -sp "  Password utente [${DB_PASS}]: " INPUT_PASS
echo ""
DB_PASS="${INPUT_PASS:-$DB_PASS}"
read -p "  Nome database [${DB_NAME}]: " INPUT_DB
DB_NAME="${INPUT_DB:-$DB_NAME}"

# ── Step 4: Crea il database ──────────────────────────────────────────
log_info "Creo il database '${DB_NAME}'..."
export PGPASSWORD="$DB_PASS"

# Verifica se il DB esiste già
if psql -h localhost -U "$DB_USER" -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
  log_warn "Il database '${DB_NAME}' esiste già. Lo pulisco..."
  psql -h localhost -U "$DB_USER" -c "DROP DATABASE IF EXISTS \"$DB_NAME\";" > /dev/null 2>&1
fi

# Crea il database
createdb_cmd="CREATE DATABASE \"$DB_NAME\";"
if psql -h localhost -U "$DB_USER" -c "$createdb_cmd" > /dev/null 2>&1; then
  log_ok "Database '${DB_NAME}' creato"
else
  # Prova con sudo per gli utenti linux
  log_warn "Tentativo con creazione da superuser..."
  if command -v sudo &> /dev/null; then
    sudo -u postgres createdb "$DB_NAME" 2>/dev/null && log_ok "Database creato (tramite sudo)" || {
      log_err "Impossibile creare il database. Prova manualmente:"
      echo "    sudo -u postgres psql -c \"CREATE DATABASE $DB_NAME OWNER $DB_USER;\""
      exit 1
    }
  else
    log_err "Impossibile creare il database. Prova manualmente:"
    echo "    createdb -U postgres $DB_NAME"
    exit 1
  fi
fi

# ── Step 5: Aggiorna .env ─────────────────────────────────────────────
log_info "Aggiorno il file .env..."
NEW_URL="postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}"

if [ -f .env ]; then
  # Aggiorna DATABASE_URL esistente
  if grep -q "^DATABASE_URL=" .env; then
    sed -i.bak "s|^DATABASE_URL=.*|DATABASE_URL=\"${NEW_URL}\"|" .env
  else
    echo "DATABASE_URL=\"${NEW_URL}\"" >> .env
  fi
  log_ok ".env aggiornato con DATABASE_URL"
else
  echo "DATABASE_URL=\"${NEW_URL}\"" > .env
  echo "OLD_SQLITE_URL=\"file:./db/custom.db\"" >> .env
  log_ok ".env creato con DATABASE_URL"
fi

# ── Step 6: Installa dipendenze se necessario ──────────────────────────
log_info "Verifico dipendenze..."
if ! npx prisma --version > /dev/null 2>&1; then
  log_warn "Prisma non trovato, installo dipendenze..."
  npm install
fi
log_ok "Dipendenze OK"

# ── Step 7: Genera client Prisma e push dello schema ──────────────────
log_info "Genero il client Prisma..."
npx prisma generate
log_ok "Client Prisma generato"

log_info "Creo le tabelle nel database PostgreSQL..."
npx prisma db push --force-reset 2>&1
log_ok "Tabelle create in PostgreSQL"

# ── Step 8: Migrazione dati ────────────────────────────────────────────
if [ -f "db/custom.db" ]; then
  log_info "Trovato database SQLite (db/custom.db). Avvio migrazione dati..."

  if npm list tsx > /dev/null 2>&1 || npx tsx --version > /dev/null 2>&1; then
    npx tsx scripts/migrate-to-postgres.ts
    log_ok "Migrazione dati completata"
  else
    log_warn "Installo tsx per la migrazione..."
    npm install -D tsx
    npx tsx scripts/migrate-to-postgres.ts
    log_ok "Migrazione dati completata"
  fi
else
  log_warn "Nessun database SQLite trovato (db/custom.db). Nessun dato da migrare."
  log_info "Il database PostgreSQL è pronto con le tabelle vuote."
fi

# ── Step 9: Verifica finale ───────────────────────────────────────────
log_info "Verifica finale..."
npx prisma db pull > /dev/null 2>&1 && log_ok "Prisma può leggere il database" || true

echo ""
echo "══════════════════════════════════════════════════════════════"
echo -e "  ${GREEN}MIGRAZIONE COMPLETATA!${NC}"
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "  Database: ${DB_NAME}"
echo "  Connessione: ${NEW_URL}"
echo ""
echo "  Per avviare il progetto:"
echo -e "    ${BLUE}npm run dev${NC}"
echo ""
echo "  Per ripristinare SQLite in futuro:"
echo "    Cambia in schema.prisma: provider = \"sqlite\""
echo "    Cambia in .env: DATABASE_URL=\"file:./db/custom.db\""
echo ""