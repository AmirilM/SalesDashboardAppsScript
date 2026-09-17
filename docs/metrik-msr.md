# Metrik MSR untuk Perhitungan Dashboard

## Total Revenue
- **Total Sales Revenue**: SUM[LocalAmount]

## Revenue by KPIGroup
- **Total Apple Revenue**: SUM[LocalAmount] WHERE [KPIGroup] = 'APPLE'
- **Total Android Revenue**: SUM[LocalAmount] WHERE [KPIGroup] = 'ANDROID'
- **Total Accessories Revenue**: SUM[LocalAmount] WHERE [KPIGroup] = 'ACCESSORIES'
- **Total VAS Revenue**: SUM[LocalAmount] WHERE [KPIGroup] = 'VAS'

## Apple Revenue by Product Line (LOB)
- **Total iPhone Revenue**: SUM[LocalAmount] WHERE [KPIGroup] = 'APPLE' AND [LOB] = 'IPHONE'
- **Total iPad Revenue**: SUM[LocalAmount] WHERE [KPIGroup] = 'APPLE' AND [LOB] = 'IPAD'
- **Total Mac Revenue**: SUM[LocalAmount] WHERE [KPIGroup] = 'APPLE' AND [LOB] = 'MAC'
- **Total Apple Watch Revenue**: SUM[LocalAmount] WHERE [KPIGroup] = 'APPLE' AND [LOB] = 'APPLE WATCH'

## Android Revenue by Brand
- **Total Samsung Revenue**: SUM[LocalAmount] WHERE [KPIGroup] = 'ANDROID' AND [BrandName] = 'SAMSUNG'
- **Total Oppo Revenue**: SUM[LocalAmount] WHERE [KPIGroup] = 'ANDROID' AND [BrandName] = 'OPPO'
- **Total Xiaomi Revenue**: SUM[LocalAmount] WHERE [KPIGroup] = 'ANDROID' AND [BrandName] = 'XIAOMI'
- **Total Huawei Revenue**: SUM[LocalAmount] WHERE [KPIGroup] = 'ANDROID' AND [BrandName] = 'HUAWEI'
- **Total Infinix Revenue**: SUM[LocalAmount] WHERE [KPIGroup] = 'ANDROID' AND [BrandName] = 'INFINIX'
- **Total Motorola Revenue**: SUM[LocalAmount] WHERE [KPIGroup] = 'ANDROID' AND [BrandName] = 'MOTOROLA'
- **Total Amazfit Revenue**: SUM[LocalAmount] WHERE [KPIGroup] = 'ANDROID' AND [BrandName] = 'AMAZFIT'