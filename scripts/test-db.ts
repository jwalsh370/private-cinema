// scripts/test-db.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  try {
    console.log('Testing SQLite database connection...')
    
    // Try to count videos (table might be empty)
    const count = await prisma.video.count()
    console.log(`✅ SQLite database connected successfully! Videos count: ${count}`)
    
  } catch (error) {
    console.error('❌ Database connection failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
