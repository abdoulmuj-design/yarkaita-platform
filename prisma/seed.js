const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const bcrypt = require('bcryptjs')

async function main() {
  // 1. Create Locations
  const katsina = await prisma.location.upsert({
    where: { code: 'KAT' },
    update: {},
    create: {
      name: 'Head Office - Katsina',
      code: 'KAT',
      address: 'Katsina',
      city: 'Katsina',
      state: 'Katsina',
    },
  })

  const abuja = await prisma.location.upsert({
    where: { code: 'ABJ' },
    update: {},
    create: {
      name: 'Showroom - Abuja',
      code: 'ABJ',
      address: 'Abuja',
      city: 'Abuja',
      state: 'FCT',
    },
  })

  // 2. Create Permissions
  const permissions = [
    'MANAGE_USERS', 'MANAGE_ROLES', 'MANAGE_PRODUCTS', 'MANAGE_INVENTORY',
    'MANAGE_ORDERS', 'MANAGE_PAYMENTS', 'MANAGE_PRODUCTION', 'MANAGE_CUSTOMERS',
    'VIEW_REPORTS', 'MANAGE_LOCATIONS', 'MANAGE_TRANSFERS', 'MANAGE_QUOTES',
  ]
  for (const permName of permissions) {
    await prisma.permission.upsert({
      where: { name: permName },
      update: {},
      create: { name: permName },
    })
  }

  // 3. Create Roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'System Administrator',
    },
  })
  const managerRole = await prisma.role.upsert({
    where: { name: 'MANAGER' },
    update: {},
    create: {
      name: 'MANAGER',
      description: 'Manager/Admin',
    },
  })
  const tailorRole = await prisma.role.upsert({
    where: { name: 'TAILOR' },
    update: {},
    create: {
      name: 'TAILOR',
      description: 'Production Tailor',
    },
  })

  // 4. Link all permissions to Admin Role
  const allPermissions = await prisma.permission.findMany()
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: perm.id,
      },
    })
  }

  // 5. Link some permissions to Manager Role
  const managerPerms = ['MANAGE_PRODUCTS', 'MANAGE_INVENTORY', 'MANAGE_ORDERS', 'MANAGE_CUSTOMERS']
  for (const permName of managerPerms) {
    const perm = await prisma.permission.findUnique({ where: { name: permName } })
    if (perm) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: managerRole.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          roleId: managerRole.id,
          permissionId: perm.id,
        },
      })
    }
  }

  // 6. Create Admin User
  const passwordHash = await bcrypt.hash('admin123', 10)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@yarkaita.com' },
    update: {},
    create: {
      email: 'admin@yarkaita.com',
      name: 'System Admin',
      passwordHash: passwordHash,
      status: 'ACTIVE',
    },
  })

  // 7. Link Admin User to Admin Role and Locations
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  })

  await prisma.userLocation.upsert({
    where: {
      userId_locationId: {
        userId: adminUser.id,
        locationId: katsina.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      locationId: katsina.id,
    },
  })
  await prisma.userLocation.upsert({
    where: {
      userId_locationId: {
        userId: adminUser.id,
        locationId: abuja.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      locationId: abuja.id,
    },
  })

  // 8. Create Categories
  const rtwCategory = await prisma.category.upsert({
    where: { slug: 'rtw' },
    update: {},
    create: { name: 'Ready-To-Wear', slug: 'rtw', description: 'Finished products ready for sale' },
  })
  const bespokeCategory = await prisma.category.upsert({
    where: { slug: 'bespoke' },
    update: {},
    create: { name: 'Bespoke', slug: 'bespoke', description: 'Custom-made clothing' },
  })
  const bridalCategory = await prisma.category.upsert({
    where: { slug: 'bridal' },
    update: {},
    create: { name: 'Bridal', slug: 'bridal', description: 'Wedding/bridal clothing' },
  })

  // 9. Create Sample Product
  const sampleProduct = await prisma.product.upsert({
    where: { slug: 'yarkaita-gown' },
    update: {},
    create: {
      name: 'YARKAITA Gown',
      slug: 'yarkaita-gown',
      description: 'Elegant African print gown',
      categoryId: rtwCategory.id,
      isActive: true,
    },
  })

  // 10. Create Product Variants
  await prisma.productVariant.upsert({
    where: { sku: 'YRG-BLK-38' },
    update: {},
    create: {
      productId: sampleProduct.id,
      sku: 'YRG-BLK-38',
      color: 'Black',
      size: '38',
      price: 80000,
      stock: 5,
    },
  })
  await prisma.productVariant.upsert({
    where: { sku: 'YRG-BLK-40' },
    update: {},
    create: {
      productId: sampleProduct.id,
      sku: 'YRG-BLK-40',
      color: 'Black',
      size: '40',
      price: 80000,
      stock: 5,
    },
  })

  // 11. Create a Collection
  const newCollection = await prisma.collection.upsert({
    where: { slug: 'new-arrivals' },
    update: {},
    create: { name: 'New Arrivals', slug: 'new-arrivals', description: 'Latest YARKAITA products' },
  })

  // 12. Link Product to Collection
  await prisma.productCollection.upsert({
    where: {
      productId_collectionId: {
        productId: sampleProduct.id,
        collectionId: newCollection.id,
      },
    },
    update: {},
    create: {
      productId: sampleProduct.id,
      collectionId: newCollection.id,
    },
  })

  console.log('✅ Seed completed! Locations, Roles, Permissions, Admin User, Categories, Products, Variants, and Collections created.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })