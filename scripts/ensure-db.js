const net = require('net');
const { execSync } = require('child_process');

function checkPort(port, host = '127.0.0.1', timeout = 800) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(timeout);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

async function ensurePostgres() {
  const isUp = await checkPort(5432);
  if (isUp) {
    console.log('\x1b[32m%s\x1b[0m', '✔ [Centra-T] Base de datos PostgreSQL activa y lista en 127.0.0.1:5432');
    return;
  }

  console.log('\x1b[33m%s\x1b[0m', '⏳ [Centra-T] Base de datos no detectada. Levantando contenedor PostgreSQL automáticamente...');

  try {
    // 1. Intentar iniciar contenedor existente
    execSync('docker start centrat-postgres 2>/dev/null', { stdio: 'ignore' });
  } catch (_) {
    try {
      // 2. Intentar docker compose / docker-compose si está disponible
      execSync('docker compose up -d 2>/dev/null || docker-compose up -d 2>/dev/null', { stdio: 'ignore' });
    } catch (_) {
      try {
        // 3. Crear y arrancar contenedor de cero si no existía
        execSync(
          'docker run -d --name centrat-postgres -p 5432:5432 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=centrat_db -v centrat_postgres_data:/var/lib/postgresql/data postgres:16-alpine',
          { stdio: 'ignore' }
        );
      } catch (err) {
        console.warn('\x1b[31m%s\x1b[0m', '⚠️ No se pudo iniciar Docker automáticamente. Verifica que Docker esté corriendo.');
      }
    }
  }

  // Esperar activamente a que PostgreSQL acepte conexiones (hasta 10 segundos)
  for (let attempt = 1; attempt <= 20; attempt++) {
    const ready = await checkPort(5432);
    if (ready) {
      console.log('\x1b[32m%s\x1b[0m', '✔ [Centra-T] PostgreSQL levantado y aceptando conexiones.');
      return;
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  console.warn('\x1b[33m%s\x1b[0m', '⚠️ Tiempo de espera agotado para PostgreSQL. Continuando arranque...');
}

ensurePostgres().then(() => {
  process.exit(0);
}).catch(() => {
  process.exit(0);
});
