/**
 * Seed script — loads master/reference data from the JSON files into MongoDB.
 *
 * Usage:
 *   npm run seed
 *
 * By default it looks for the JSON files in seed/data/. Copy your existing
 * countries.json, currencies.json, payment-modes.json, regions.json,
 * services.json, and vacs.json into that folder (filenames must match).
 *
 * The script is idempotent: it clears each collection before inserting,
 * so it's safe to re-run.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const Region = require('../models/Region');
const Currency = require('../models/Currency');
const Country = require('../models/Country');
const VAC = require('../models/VAC');
const Service = require('../models/Service');
const PaymentMode = require('../models/PaymentMode');

const DATA_DIR = path.join(__dirname, 'data');

function loadJSON(filename) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Missing seed file: ${filePath}\nCopy your ${filename} into ${DATA_DIR}/ before seeding.`
    );
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

async function seed() {
  await connectDB();

  try {
    console.log('Loading JSON seed files...');
    const regions = loadJSON('regions.json');
    const currencies = loadJSON('currencies.json');
    const countries = loadJSON('countries.json');
    const vacs = loadJSON('vacs.json');
    const services = loadJSON('services.json');
    const paymentModes = loadJSON('payment-modes.json');

    console.log('Clearing existing master data...');
    await Promise.all([
      Region.deleteMany({}),
      Currency.deleteMany({}),
      Country.deleteMany({}),
      VAC.deleteMany({}),
      Service.deleteMany({}),
      PaymentMode.deleteMany({}),
    ]);

    // 1. Regions (no dependencies)
    console.log(`Inserting ${regions.length} regions...`);
    const insertedRegions = await Region.insertMany(regions);
    const regionByCode = new Map(insertedRegions.map((r) => [r.Region_Code, r]));

    // 2. Currencies (no dependencies)
    console.log(`Inserting ${currencies.length} currencies...`);
    const insertedCurrencies = await Currency.insertMany(currencies);
    const currencyByCode = new Map(insertedCurrencies.map((c) => [c.Currency_Code, c]));

    // 3. Countries (depend on Region + Currency)
    console.log(`Inserting ${countries.length} countries...`);
    const countryDocs = countries.map((c) => ({
      ...c,
      Region_Ref: regionByCode.get(c.Region_Code)?._id,
      Currency_Ref: currencyByCode.get(c.Currency_Code)?._id,
    }));
    const insertedCountries = await Country.insertMany(countryDocs);
    const countryByCode = new Map(insertedCountries.map((c) => [c.Country_Code, c]));

    // 4. VACs (depend on Country)
    console.log(`Inserting ${vacs.length} VACs...`);
    const vacDocs = vacs.map((v) => ({
      ...v,
      Country_Ref: countryByCode.get(v.Country_Code)?._id,
    }));
    await VAC.insertMany(vacDocs);

    // 5. Services (depend on Country + Currency)
    console.log(`Inserting ${services.length} services...`);
    const serviceDocs = services.map((s) => ({
      ...s,
      Country_Ref: countryByCode.get(s.Country_Code)?._id,
      Currency_Ref: currencyByCode.get(s.Currency_Code)?._id,
    }));
    await Service.insertMany(serviceDocs);

    // 6. Payment modes (depend on Currency)
    console.log(`Inserting ${paymentModes.length} payment modes...`);
    const paymentModeDocs = paymentModes.map((p) => ({
      ...p,
      Currency_Ref: currencyByCode.get(p.Currency_Code)?._id,
    }));
    await PaymentMode.insertMany(paymentModeDocs);

    console.log('Seed complete.');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

seed();
