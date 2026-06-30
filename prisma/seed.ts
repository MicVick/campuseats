// Seed script for CampusEats
// Creates 6 vendors, menus, vendor accounts, MVRC reports, and test data

import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const connectionString = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding CampusEats database...\n');

  // Clean existing data
  await prisma.favourite.deleteMany();
  await prisma.foodFeedback.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customizationOption.deleteMany();
  await prisma.customizationGroup.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.mVRCReport.deleteMany();
  await prisma.vendorAccount.deleteMany();
  await prisma.otpStore.deleteMany();
  await prisma.promoCode.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.user.deleteMany();

  // ─── Test Students ──────────────────────────────────────────────

  const student1 = await prisma.user.create({
    data: {
      name: 'Arjun Sharma',
      email: 'arjun.sharma@iima.ac.in',
      authProvider: 'email',
    },
  });

  const student2 = await prisma.user.create({
    data: {
      name: 'Priya Patel',
      email: 'priya.patel@iima.ac.in',
      authProvider: 'google',
    },
  });

  const student3 = await prisma.user.create({
    data: {
      name: 'Rahul Mehta',
      email: 'rahul.mehta@iima.ac.in',
      authProvider: 'email',
    },
  });

  console.log('✅ Created 3 test students');

  // ─── Vendors ──────────────────────────────────────────────────

  const passwordHash = await bcrypt.hash('vendor123', 12);

  // Vendor 1: Mess Café
  const messCafe = await prisma.vendor.create({
    data: {
      name: 'Mess Café',
      description: 'The main campus mess — hearty thalis, fresh parathas, and hot beverages available all day.',
      imageUrl: '/images/vendors/mess-cafe.jpg',
      cuisineTags: JSON.stringify(['North Indian', 'Thali', 'Beverages']),
      area: 'Main Campus, Near D-Block',
      hasVeg: true,
      hasNonVeg: true,
      avgRating: 4.1,
      ratingCount: 87,
      mvrcRating: 4.3,
      openHours: JSON.stringify({
        mon: { open: '07:30', close: '22:00' },
        tue: { open: '07:30', close: '22:00' },
        wed: { open: '07:30', close: '22:00' },
        thu: { open: '07:30', close: '22:00' },
        fri: { open: '07:30', close: '22:00' },
        sat: { open: '08:00', close: '21:00' },
        sun: { open: '08:00', close: '21:00' },
      }),
      minOrder: 5000, // ₹50
      packagingFee: 1000, // ₹10
      avgPrepTimeMins: 15,
      upiId: 'messcafe@upi',
      upiQrImageUrl: '/images/upi/mess-cafe-qr.png',
    },
  });

  // Vendor 2: Roll & Wrap Corner
  const rollCorner = await prisma.vendor.create({
    data: {
      name: 'Roll & Wrap Corner',
      description: 'Crispy rolls, loaded wraps, and golden fries. The go-to spot for a quick bite.',
      imageUrl: '/images/vendors/roll-corner.jpg',
      cuisineTags: JSON.stringify(['Rolls', 'Wraps', 'Fast Food']),
      area: 'Food Street, Gate 2',
      hasVeg: true,
      hasNonVeg: true,
      avgRating: 4.3,
      ratingCount: 124,
      mvrcRating: 3.8,
      openHours: JSON.stringify({
        mon: { open: '11:00', close: '23:00' },
        tue: { open: '11:00', close: '23:00' },
        wed: { open: '11:00', close: '23:00' },
        thu: { open: '11:00', close: '23:00' },
        fri: { open: '11:00', close: '23:30' },
        sat: { open: '11:00', close: '23:30' },
        sun: { open: '12:00', close: '22:00' },
      }),
      minOrder: 8000, // ₹80
      packagingFee: 1500, // ₹15
      avgPrepTimeMins: 12,
      upiId: 'rollcorner@upi',
      upiQrImageUrl: '/images/upi/roll-corner-qr.png',
    },
  });

  // Vendor 3: Chai & Maggi Point
  const chaiPoint = await prisma.vendor.create({
    data: {
      name: 'Chai & Maggi Point',
      description: 'Late-night fuel station. Maggi in every style, cutting chai, and quick snacks when the library runs late.',
      imageUrl: '/images/vendors/chai-maggi.jpg',
      cuisineTags: JSON.stringify(['Chai', 'Maggi', 'Snacks', 'Late Night']),
      area: 'Near Library, Heritage Campus',
      hasVeg: true,
      hasNonVeg: false,
      avgRating: 4.5,
      ratingCount: 203,
      mvrcRating: 4.0,
      openHours: JSON.stringify({
        mon: { open: '16:00', close: '02:00' },
        tue: { open: '16:00', close: '02:00' },
        wed: { open: '16:00', close: '02:00' },
        thu: { open: '16:00', close: '02:00' },
        fri: { open: '16:00', close: '03:00' },
        sat: { open: '16:00', close: '03:00' },
        sun: { open: '17:00', close: '01:00' },
      }),
      minOrder: 3000, // ₹30
      packagingFee: 500, // ₹5
      avgPrepTimeMins: 8,
      upiId: 'chaimaggi@upi',
      upiQrImageUrl: '/images/upi/chai-maggi-qr.png',
    },
  });

  // Vendor 4: Shakes & Juices Counter
  const shakesCounter = await prisma.vendor.create({
    data: {
      name: 'Shakes & Juices Counter',
      description: 'Fresh fruit juices, thick shakes, and cold coffee to beat the Gujarat heat.',
      imageUrl: '/images/vendors/shakes-juices.jpg',
      cuisineTags: JSON.stringify(['Beverages', 'Juices', 'Shakes', 'Healthy']),
      area: 'Sports Complex, New Campus',
      hasVeg: true,
      hasNonVeg: false,
      avgRating: 4.2,
      ratingCount: 65,
      mvrcRating: 4.5,
      openHours: JSON.stringify({
        mon: { open: '09:00', close: '20:00' },
        tue: { open: '09:00', close: '20:00' },
        wed: { open: '09:00', close: '20:00' },
        thu: { open: '09:00', close: '20:00' },
        fri: { open: '09:00', close: '20:00' },
        sat: { open: '10:00', close: '19:00' },
        sun: { open: '10:00', close: '19:00' },
      }),
      minOrder: 5000, // ₹50
      packagingFee: 0,
      avgPrepTimeMins: 5,
      upiId: 'shakesjuices@upi',
      upiQrImageUrl: '/images/upi/shakes-juices-qr.png',
    },
  });

  // Vendor 5: Late-Night Bites
  const lateNight = await prisma.vendor.create({
    data: {
      name: 'Late-Night Bites',
      description: 'Burgers, sandwiches, and momos for the midnight crowd. Open when everything else closes.',
      imageUrl: '/images/vendors/late-night.jpg',
      cuisineTags: JSON.stringify(['Burgers', 'Sandwiches', 'Momos', 'Late Night']),
      area: 'Gate 3 Food Stalls',
      hasVeg: true,
      hasNonVeg: true,
      avgRating: 3.9,
      ratingCount: 156,
      mvrcRating: 3.5,
      openHours: JSON.stringify({
        mon: { open: '19:00', close: '03:00' },
        tue: { open: '19:00', close: '03:00' },
        wed: { open: '19:00', close: '03:00' },
        thu: { open: '19:00', close: '03:00' },
        fri: { open: '18:00', close: '04:00' },
        sat: { open: '18:00', close: '04:00' },
        sun: { open: '19:00', close: '02:00' },
      }),
      minOrder: 10000, // ₹100
      packagingFee: 2000, // ₹20
      avgPrepTimeMins: 18,
      upiId: 'latenightbites@upi',
      upiQrImageUrl: '/images/upi/late-night-qr.png',
    },
  });

  // Vendor 6: South Express
  const southExpress = await prisma.vendor.create({
    data: {
      name: 'South Express',
      description: 'Crispy dosas, fluffy idlis, and piping hot filter coffee. Pure veg South Indian comfort.',
      imageUrl: '/images/vendors/south-express.jpg',
      cuisineTags: JSON.stringify(['South Indian', 'Dosa', 'Idli', 'Veg']),
      area: 'Main Campus Canteen',
      hasVeg: true,
      hasNonVeg: false,
      avgRating: 4.4,
      ratingCount: 98,
      mvrcRating: 4.6,
      openHours: JSON.stringify({
        mon: { open: '07:00', close: '21:00' },
        tue: { open: '07:00', close: '21:00' },
        wed: { open: '07:00', close: '21:00' },
        thu: { open: '07:00', close: '21:00' },
        fri: { open: '07:00', close: '21:00' },
        sat: { open: '07:30', close: '20:00' },
        sun: { open: '08:00', close: '20:00' },
      }),
      minOrder: 6000, // ₹60
      packagingFee: 1000, // ₹10
      avgPrepTimeMins: 12,
      upiId: 'southexpress@upi',
      upiQrImageUrl: '/images/upi/south-express-qr.png',
    },
  });

  console.log('✅ Created 6 vendors');

  // ─── Vendor Accounts ──────────────────────────────────────────

  await prisma.vendorAccount.createMany({
    data: [
      { vendorId: messCafe.id, email: 'messcafe@campuseats.in', passwordHash },
      { vendorId: rollCorner.id, email: 'rollcorner@campuseats.in', passwordHash },
      { vendorId: chaiPoint.id, email: 'chaimaggi@campuseats.in', passwordHash },
      { vendorId: shakesCounter.id, email: 'shakesjuices@campuseats.in', passwordHash },
      { vendorId: lateNight.id, email: 'latenightbites@campuseats.in', passwordHash },
      { vendorId: southExpress.id, email: 'southexpress@campuseats.in', passwordHash },
    ],
  });

  console.log('✅ Created vendor accounts (password: vendor123)');

  // ─── Menu: Mess Café ──────────────────────────────────────────

  const mcBreakfast = await prisma.menuCategory.create({
    data: { vendorId: messCafe.id, name: 'Breakfast', sortOrder: 1 },
  });
  const mcMains = await prisma.menuCategory.create({
    data: { vendorId: messCafe.id, name: 'Mains', sortOrder: 2 },
  });
  const mcBev = await prisma.menuCategory.create({
    data: { vendorId: messCafe.id, name: 'Beverages', sortOrder: 3 },
  });

  const aluParatha = await prisma.menuItem.create({
    data: { vendorId: messCafe.id, categoryId: mcBreakfast.id, name: 'Aloo Paratha', description: 'Stuffed with spiced mashed potatoes, served with curd and pickle', price: 6000, isVeg: true },
  });
  await prisma.menuItem.create({
    data: { vendorId: messCafe.id, categoryId: mcBreakfast.id, name: 'Paneer Paratha', description: 'Stuffed with crumbled paneer and green chillies', price: 7000, isVeg: true },
  });
  await prisma.menuItem.create({
    data: { vendorId: messCafe.id, categoryId: mcBreakfast.id, name: 'Egg Bhurji', description: 'Scrambled eggs with onions, tomatoes, and spices', price: 5000, isVeg: false },
  });
  await prisma.menuItem.create({
    data: { vendorId: messCafe.id, categoryId: mcMains.id, name: 'Veg Thali', description: 'Dal, sabzi, roti, rice, raita, and papad', price: 12000, isVeg: true },
  });
  await prisma.menuItem.create({
    data: { vendorId: messCafe.id, categoryId: mcMains.id, name: 'Non-Veg Thali', description: 'Chicken curry, dal, roti, rice, raita, and papad', price: 15000, isVeg: false },
  });
  await prisma.menuItem.create({
    data: { vendorId: messCafe.id, categoryId: mcMains.id, name: 'Rajma Chawal', description: 'Classic kidney bean curry with steamed rice', price: 8000, isVeg: true },
  });
  await prisma.menuItem.create({
    data: { vendorId: messCafe.id, categoryId: mcBev.id, name: 'Masala Chai', price: 2000, isVeg: true },
  });
  await prisma.menuItem.create({
    data: { vendorId: messCafe.id, categoryId: mcBev.id, name: 'Cold Coffee', description: 'Blended with ice cream', price: 5000, isVeg: true },
  });

  // Customization for Aloo Paratha
  const parathaCG = await prisma.customizationGroup.create({
    data: { menuItemId: aluParatha.id, name: 'Add-ons', type: 'multi', required: false, minSelect: 0, maxSelect: 3 },
  });
  await prisma.customizationOption.createMany({
    data: [
      { groupId: parathaCG.id, name: 'Extra Butter', priceDelta: 1000 },
      { groupId: parathaCG.id, name: 'Extra Curd', priceDelta: 500 },
      { groupId: parathaCG.id, name: 'Green Chutney', priceDelta: 500 },
    ],
  });

  // ─── Menu: Roll & Wrap Corner ─────────────────────────────────

  const rcRolls = await prisma.menuCategory.create({
    data: { vendorId: rollCorner.id, name: 'Rolls', sortOrder: 1 },
  });
  const rcWraps = await prisma.menuCategory.create({
    data: { vendorId: rollCorner.id, name: 'Wraps', sortOrder: 2 },
  });
  const rcSides = await prisma.menuCategory.create({
    data: { vendorId: rollCorner.id, name: 'Sides', sortOrder: 3 },
  });

  const paneerRoll = await prisma.menuItem.create({
    data: { vendorId: rollCorner.id, categoryId: rcRolls.id, name: 'Paneer Tikka Roll', description: 'Grilled paneer with mint chutney in a flaky paratha', price: 9000, isVeg: true },
  });
  await prisma.menuItem.create({
    data: { vendorId: rollCorner.id, categoryId: rcRolls.id, name: 'Chicken Seekh Roll', description: 'Spiced chicken seekh kebab in a rumali roti', price: 11000, isVeg: false },
  });
  await prisma.menuItem.create({
    data: { vendorId: rollCorner.id, categoryId: rcRolls.id, name: 'Egg Roll', description: 'Egg omelette with onions and sauces', price: 7000, isVeg: false },
  });
  await prisma.menuItem.create({
    data: { vendorId: rollCorner.id, categoryId: rcWraps.id, name: 'Falafel Wrap', description: 'Crispy falafel with hummus and fresh veggies', price: 10000, isVeg: true },
  });
  await prisma.menuItem.create({
    data: { vendorId: rollCorner.id, categoryId: rcWraps.id, name: 'Chicken Shawarma Wrap', description: 'Juicy chicken with garlic sauce', price: 12000, isVeg: false },
  });
  await prisma.menuItem.create({
    data: { vendorId: rollCorner.id, categoryId: rcSides.id, name: 'French Fries', description: 'Crispy golden fries', price: 6000, isVeg: true },
  });
  await prisma.menuItem.create({
    data: { vendorId: rollCorner.id, categoryId: rcSides.id, name: 'Peri Peri Fries', description: 'Fries tossed in spicy peri peri seasoning', price: 8000, isVeg: true },
  });

  // Customization for Paneer Tikka Roll
  const rollSize = await prisma.customizationGroup.create({
    data: { menuItemId: paneerRoll.id, name: 'Size', type: 'single', required: true, minSelect: 1, maxSelect: 1 },
  });
  await prisma.customizationOption.createMany({
    data: [
      { groupId: rollSize.id, name: 'Regular', priceDelta: 0 },
      { groupId: rollSize.id, name: 'Large', priceDelta: 3000 },
    ],
  });

  const rollExtras = await prisma.customizationGroup.create({
    data: { menuItemId: paneerRoll.id, name: 'Extras', type: 'multi', required: false, minSelect: 0, maxSelect: 3 },
  });
  await prisma.customizationOption.createMany({
    data: [
      { groupId: rollExtras.id, name: 'Extra Cheese', priceDelta: 2000 },
      { groupId: rollExtras.id, name: 'Jalapenos', priceDelta: 1500 },
      { groupId: rollExtras.id, name: 'Double Paneer', priceDelta: 4000 },
    ],
  });

  // ─── Menu: Chai & Maggi Point ─────────────────────────────────

  const cmMaggi = await prisma.menuCategory.create({
    data: { vendorId: chaiPoint.id, name: 'Maggi', sortOrder: 1 },
  });
  const cmChai = await prisma.menuCategory.create({
    data: { vendorId: chaiPoint.id, name: 'Chai & Coffee', sortOrder: 2 },
  });
  const cmSnacks = await prisma.menuCategory.create({
    data: { vendorId: chaiPoint.id, name: 'Snacks', sortOrder: 3 },
  });

  const masalaMaggi = await prisma.menuItem.create({
    data: { vendorId: chaiPoint.id, categoryId: cmMaggi.id, name: 'Classic Maggi', description: 'The OG 2-minute noodle, made with love', price: 4000, isVeg: true },
  });
  await prisma.menuItem.create({
    data: { vendorId: chaiPoint.id, categoryId: cmMaggi.id, name: 'Cheese Maggi', description: 'Loaded with melted cheese', price: 6000, isVeg: true },
  });
  await prisma.menuItem.create({
    data: { vendorId: chaiPoint.id, categoryId: cmMaggi.id, name: 'Masala Maggi', description: 'Extra spicy with vegetables', price: 5000, isVeg: true },
  });
  await prisma.menuItem.create({
    data: { vendorId: chaiPoint.id, categoryId: cmMaggi.id, name: 'Schezwan Maggi', description: 'Indo-Chinese style with schezwan sauce', price: 6000, isVeg: true },
  });
  await prisma.menuItem.create({
    data: { vendorId: chaiPoint.id, categoryId: cmChai.id, name: 'Cutting Chai', price: 1500, isVeg: true },
  });
  await prisma.menuItem.create({
    data: { vendorId: chaiPoint.id, categoryId: cmChai.id, name: 'Masala Chai', price: 2500, isVeg: true },
  });
  await prisma.menuItem.create({
    data: { vendorId: chaiPoint.id, categoryId: cmChai.id, name: 'Black Coffee', price: 3000, isVeg: true },
  });
  await prisma.menuItem.create({
    data: { vendorId: chaiPoint.id, categoryId: cmSnacks.id, name: 'Bread Omelette', description: 'Fluffy omelette between toasted bread', price: 4000, isVeg: false },
  });
  await prisma.menuItem.create({
    data: { vendorId: chaiPoint.id, categoryId: cmSnacks.id, name: 'Veg Sandwich', description: 'Grilled sandwich with vegetables and cheese', price: 5000, isVeg: true },
  });

  // Customization for Classic Maggi
  const maggiExtras = await prisma.customizationGroup.create({
    data: { menuItemId: masalaMaggi.id, name: 'Add-ons', type: 'multi', required: false, minSelect: 0, maxSelect: 4 },
  });
  await prisma.customizationOption.createMany({
    data: [
      { groupId: maggiExtras.id, name: 'Extra Cheese', priceDelta: 2000 },
      { groupId: maggiExtras.id, name: 'Vegetables', priceDelta: 1500 },
      { groupId: maggiExtras.id, name: 'Butter', priceDelta: 1000 },
      { groupId: maggiExtras.id, name: 'Egg', priceDelta: 1500 },
    ],
  });

  // ─── Menu: Shakes & Juices Counter ────────────────────────────

  const sjShakes = await prisma.menuCategory.create({
    data: { vendorId: shakesCounter.id, name: 'Shakes', sortOrder: 1 },
  });
  const sjJuices = await prisma.menuCategory.create({
    data: { vendorId: shakesCounter.id, name: 'Juices', sortOrder: 2 },
  });

  await prisma.menuItem.create({
    data: { vendorId: shakesCounter.id, categoryId: sjShakes.id, name: 'Oreo Shake', description: 'Thick chocolate shake blended with Oreo cookies', price: 8000, isVeg: true },
  });
  await prisma.menuItem.create({
    data: { vendorId: shakesCounter.id, categoryId: sjShakes.id, name: 'Mango Shake', description: 'Fresh Alphonso mango shake (seasonal)', price: 7000, isVeg: true },
  });
  await prisma.menuItem.create({
    data: { vendorId: shakesCounter.id, categoryId: sjShakes.id, name: 'Cold Coffee', description: 'Classic cold coffee with ice cream', price: 6000, isVeg: true },
  });
  await prisma.menuItem.create({
    data: { vendorId: shakesCounter.id, categoryId: sjShakes.id, name: 'Butterscotch Shake', description: 'Creamy butterscotch with crunchy bits', price: 7500, isVeg: true },
  });
  await prisma.menuItem.create({
    data: { vendorId: shakesCounter.id, categoryId: sjJuices.id, name: 'Watermelon Juice', description: 'Fresh watermelon with a hint of mint', price: 5000, isVeg: true },
  });
  await prisma.menuItem.create({
    data: { vendorId: shakesCounter.id, categoryId: sjJuices.id, name: 'Sweet Lime Soda', description: 'Refreshing mosambi with soda', price: 4500, isVeg: true },
  });
  await prisma.menuItem.create({
    data: { vendorId: shakesCounter.id, categoryId: sjJuices.id, name: 'Mixed Fruit Juice', description: 'Seasonal fruits blended together', price: 6000, isVeg: true },
  });

  // ─── Menu: Late-Night Bites ───────────────────────────────────

  const lnBurgers = await prisma.menuCategory.create({
    data: { vendorId: lateNight.id, name: 'Burgers', sortOrder: 1 },
  });
  const lnMomos = await prisma.menuCategory.create({
    data: { vendorId: lateNight.id, name: 'Momos', sortOrder: 2 },
  });
  const lnSandwiches = await prisma.menuCategory.create({
    data: { vendorId: lateNight.id, name: 'Sandwiches', sortOrder: 3 },
  });

  const classicBurger = await prisma.menuItem.create({
    data: { vendorId: lateNight.id, categoryId: lnBurgers.id, name: 'Classic Veg Burger', description: 'Crispy patty with lettuce, tomato, and special sauce', price: 8000, isVeg: true },
  });
  await prisma.menuItem.create({
    data: { vendorId: lateNight.id, categoryId: lnBurgers.id, name: 'Chicken Burger', description: 'Grilled chicken patty with mayo and pickles', price: 10000, isVeg: false },
  });
  await prisma.menuItem.create({
    data: { vendorId: lateNight.id, categoryId: lnMomos.id, name: 'Steamed Veg Momos', description: '8 pieces with spicy red chutney', price: 6000, isVeg: true },
  });
  await prisma.menuItem.create({
    data: { vendorId: lateNight.id, categoryId: lnMomos.id, name: 'Fried Chicken Momos', description: '8 pieces, crispy fried with mayo dip', price: 8000, isVeg: false },
  });
  await prisma.menuItem.create({
    data: { vendorId: lateNight.id, categoryId: lnMomos.id, name: 'Tandoori Momos', description: '6 pieces, grilled with tandoori spices', price: 9000, isVeg: true },
  });
  await prisma.menuItem.create({
    data: { vendorId: lateNight.id, categoryId: lnSandwiches.id, name: 'Grilled Cheese Sandwich', description: 'Three-cheese grilled sandwich', price: 7000, isVeg: true },
  });
  await prisma.menuItem.create({
    data: { vendorId: lateNight.id, categoryId: lnSandwiches.id, name: 'Club Sandwich', description: 'Triple-decker with chicken, egg, and veggies', price: 12000, isVeg: false },
  });

  // Customization for Classic Veg Burger
  const burgerSize = await prisma.customizationGroup.create({
    data: { menuItemId: classicBurger.id, name: 'Size', type: 'single', required: true, minSelect: 1, maxSelect: 1 },
  });
  await prisma.customizationOption.createMany({
    data: [
      { groupId: burgerSize.id, name: 'Regular', priceDelta: 0 },
      { groupId: burgerSize.id, name: 'Double Patty', priceDelta: 4000 },
    ],
  });

  // ─── Menu: South Express ──────────────────────────────────────

  const seDosa = await prisma.menuCategory.create({
    data: { vendorId: southExpress.id, name: 'Dosa', sortOrder: 1 },
  });
  const seIdli = await prisma.menuCategory.create({
    data: { vendorId: southExpress.id, name: 'Idli & Vada', sortOrder: 2 },
  });
  const seCoffee = await prisma.menuCategory.create({
    data: { vendorId: southExpress.id, name: 'Coffee & Beverages', sortOrder: 3 },
  });

  await prisma.menuItem.create({
    data: { vendorId: southExpress.id, categoryId: seDosa.id, name: 'Plain Dosa', description: 'Crispy golden dosa with sambar and chutneys', price: 5000, isVeg: true },
  });
  await prisma.menuItem.create({
    data: { vendorId: southExpress.id, categoryId: seDosa.id, name: 'Masala Dosa', description: 'Stuffed with spiced potato filling', price: 7000, isVeg: true },
  });
  await prisma.menuItem.create({
    data: { vendorId: southExpress.id, categoryId: seDosa.id, name: 'Mysore Masala Dosa', description: 'With spicy red chutney spread inside', price: 8000, isVeg: true },
  });
  await prisma.menuItem.create({
    data: { vendorId: southExpress.id, categoryId: seDosa.id, name: 'Cheese Dosa', description: 'Loaded with melted cheese', price: 9000, isVeg: true },
  });
  await prisma.menuItem.create({
    data: { vendorId: southExpress.id, categoryId: seIdli.id, name: 'Idli (2 pcs)', description: 'Soft steamed idlis with sambar and chutney', price: 4000, isVeg: true },
  });
  await prisma.menuItem.create({
    data: { vendorId: southExpress.id, categoryId: seIdli.id, name: 'Medu Vada (2 pcs)', description: 'Crispy urad dal vadas', price: 4500, isVeg: true },
  });
  await prisma.menuItem.create({
    data: { vendorId: southExpress.id, categoryId: seIdli.id, name: 'Uttapam', description: 'Thick pancake topped with onions and tomatoes', price: 6000, isVeg: true },
  });
  await prisma.menuItem.create({
    data: { vendorId: southExpress.id, categoryId: seCoffee.id, name: 'Filter Coffee', description: 'Authentic South Indian filter coffee', price: 3000, isVeg: true },
  });
  await prisma.menuItem.create({
    data: { vendorId: southExpress.id, categoryId: seCoffee.id, name: 'Badam Milk', description: 'Warm almond milk with saffron', price: 4000, isVeg: true },
  });

  console.log('✅ Created menus with categories, items, and customization groups');

  // ─── MVRC Reports ─────────────────────────────────────────────

  const vendors = [messCafe, rollCorner, chaiPoint, shakesCounter, lateNight, southExpress];
  const mvrcData = [
    { rating: 4.3, hygiene: 4.5, quality: 4.2, notes: 'Kitchen well-maintained. Staff follows hygiene protocols.', actions: 'None required.' },
    { rating: 3.8, hygiene: 3.5, quality: 4.0, notes: 'Oil quality needs monitoring. Packaging area could be cleaner.', actions: 'Install exhaust fan near frying station. Monthly oil quality checks.' },
    { rating: 4.0, hygiene: 4.0, quality: 4.2, notes: 'Small setup but well-managed. Water quality verified.', actions: 'Add handwash station near counter.' },
    { rating: 4.5, hygiene: 4.8, quality: 4.3, notes: 'Excellent hygiene standards. Fresh ingredients daily. Cold chain maintained.', actions: 'None required.' },
    { rating: 3.5, hygiene: 3.2, quality: 3.8, notes: 'Late-night operations need better waste management. Food quality is good.', actions: 'Improve waste disposal schedule. Add pest control measures.' },
    { rating: 4.6, hygiene: 4.7, quality: 4.5, notes: 'Best hygiene standards on campus. Kitchen is spotless. Ingredients sourced fresh.', actions: 'None required. Set as benchmark for other vendors.' },
  ];

  for (let i = 0; i < vendors.length; i++) {
    await prisma.mVRCReport.create({
      data: {
        vendorId: vendors[i].id,
        rating: mvrcData[i].rating,
        hygieneScore: mvrcData[i].hygiene,
        foodQualityScore: mvrcData[i].quality,
        complianceNotes: mvrcData[i].notes,
        correctiveActions: mvrcData[i].actions,
        reportUrl: `/reports/mvrc-${vendors[i].name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`,
        assessmentDate: new Date('2026-06-15'),
        createdBy: 'MVRC Committee',
      },
    });
  }

  console.log('✅ Created MVRC reports');

  // ─── Sample Orders ────────────────────────────────────────────

  // A completed order for student 1 at Chai & Maggi Point
  const order1 = await prisma.order.create({
    data: {
      userId: student1.id,
      vendorId: chaiPoint.id,
      status: 'completed',
      itemTotal: 9500,
      packagingFee: 500,
      grandTotal: 10000,
      specialInstructions: 'Extra spicy please',
      estimatedPrepMins: 8,
      statusTimeline: JSON.stringify([
        { status: 'placed', at: '2026-06-28T18:00:00Z' },
        { status: 'accepted', at: '2026-06-28T18:02:00Z' },
        { status: 'preparing', at: '2026-06-28T18:02:30Z' },
        { status: 'ready_for_pickup', at: '2026-06-28T18:10:00Z' },
        { status: 'completed', at: '2026-06-28T18:15:00Z' },
      ]),
    },
  });

  await prisma.orderItem.createMany({
    data: [
      { orderId: order1.id, menuItemId: masalaMaggi.id, nameSnapshot: 'Classic Maggi', qty: 2, unitPrice: 4000, selectedOptions: JSON.stringify([{ name: 'Extra Cheese', priceDelta: 2000 }]) },
    ],
  });

  // An active order for student 2 at Roll & Wrap Corner
  const order2 = await prisma.order.create({
    data: {
      userId: student2.id,
      vendorId: rollCorner.id,
      status: 'preparing',
      itemTotal: 9000,
      packagingFee: 1500,
      grandTotal: 10500,
      estimatedPrepMins: 12,
      statusTimeline: JSON.stringify([
        { status: 'placed', at: new Date().toISOString() },
        { status: 'accepted', at: new Date().toISOString() },
        { status: 'preparing', at: new Date().toISOString() },
      ]),
    },
  });

  await prisma.orderItem.create({
    data: { orderId: order2.id, menuItemId: paneerRoll.id, nameSnapshot: 'Paneer Tikka Roll (Large)', qty: 1, unitPrice: 12000, selectedOptions: JSON.stringify([{ name: 'Large', priceDelta: 3000 }]) },
  });

  console.log('✅ Created sample orders');

  // ─── Sample Reviews ───────────────────────────────────────────

  await prisma.review.create({
    data: {
      orderId: order1.id,
      userId: student1.id,
      vendorId: chaiPoint.id,
      rating: 5,
      text: 'Best Maggi on campus! Always consistent quality, and the extra cheese is worth it.',
    },
  });

  console.log('✅ Created sample review');

  // ─── Promo Codes ──────────────────────────────────────────────

  await prisma.promoCode.createMany({
    data: [
      { code: 'WELCOME50', type: 'flat', value: 5000, minOrder: 10000, active: true }, // ₹50 off on ₹100+ orders
      { code: 'CAMPUS10', type: 'percent', value: 10, minOrder: 15000, maxDiscount: 10000, active: true }, // 10% off, max ₹100
    ],
  });

  console.log('✅ Created promo codes');

  console.log('\n🎉 Seed complete! Database is ready for development.\n');
  console.log('Test credentials:');
  console.log('  Students: arjun.sharma@iima.ac.in, priya.patel@iima.ac.in, rahul.mehta@iima.ac.in');
  console.log('  Vendors: messcafe@campuseats.in / vendor123 (and similarly for other vendors)');
  console.log('  Mock OTP: 123456');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
