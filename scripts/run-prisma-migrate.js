import { execSync } from 'child_process';

// Gera e aplica migração do Prisma
try {
  console.log('Gerando migração do Prisma...');
  execSync('npx prisma db push', { 
    stdio: 'inherit',
    cwd: '/vercel/share/v0-project'
  });
  console.log('Migração aplicada com sucesso!');
} catch (error) {
  console.error('Erro ao aplicar migração:', error.message);
  process.exit(1);
}
