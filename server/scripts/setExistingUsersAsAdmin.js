import prisma from '../db/prisma.js';

async function setExistingUsersAsAdmin() {
  try {
    // Update all existing users (non-admin) to be admin
    const result = await prisma.user.updateMany({
      where: {
        role: {
          not: 'admin'
        }
      },
      data: {
        role: 'admin'
      }
    });

    console.log(`Updated ${result.count} users to admin role`);
    
    console.log('All existing users are now admins. New users will be standard users.');
  } catch (error) {
    console.error('Error updating users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setExistingUsersAsAdmin();

