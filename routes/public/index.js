const express = require("express");
const route = express.Router();

const Store = require("../../models/store");
const Product = require("../../models/product");
const Brand = require("../../models/brand");

route.get("/", async (req, res) => {
  try {
    const stores = await Store.find({
      status: "active",
      isArchived: false,
      isDeleted: false,
    }).select({ slug: 1, updatedAt: 1 });

    const products = await Product.find({
      status: "active",
      isArchived: false,
      isDeleted: false,
    })
      .select({ slug: 1, updatedAt: 1, store: 1 })
      .populate({
        path: "store",
        select: { slug: 1 },
      });

    const brands = await Brand.find({
      status: "active",
    }).select({ slug: 1, updatedAt: 1 });

    return res.status(200).json({ stores, products, brands });
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

module.exports = route;

const items2 = [
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64b92fca65cfad0008203d68/products/64b9480444af170008fbfbd8/LKBDGY1IDNAEP.png         %2BiKqqw ",
    key: "stores/64b92fca65cfad0008203d68/products/64b9480444af170008fbfbd8/LKBDGY1IDNAEP.png",
  },
];

const items = [
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/brands/apex/LK8NBBJXUCY60.png",
    key: "brands/apex/LK8NBBJXUCY60.png",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/brands/apex/LK8NC4DPBIK7Y.webp",
    key: "brands/apex/LK8NC4DPBIK7Y.webp",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/brands/bata/LK8ND83GI3LB3.png",
    key: "brands/bata/LK8ND83GI3LB3.png",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/brands/mercusys/LK8NFVTZUWBMP.png",
    key: "brands/mercusys/LK8NFVTZUWBMP.png",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/brands/motorola/LK10DWK13PKIT.svg",
    key: "brands/motorola/LK10DWK13PKIT.svg",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/brands/sailor/LK8NHTPKWNJ0K.png",
    key: "brands/sailor/LK8NHTPKWNJ0K.png",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/brands/samsung/LKB9FVLGELD8H.svg",
    key: "brands/samsung/LKB9FVLGELD8H.svg",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/brands/xiaomi/LK10C1R1ZV54F.svg",
    key: "brands/xiaomi/LK10C1R1ZV54F.svg",
  },
  {
    location: "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/data/",
    key: "data/",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/data/logo.png",
    key: "data/logo.png",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/data/logo.svg",
    key: "data/logo.svg",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/data/logo2.png",
    key: "data/logo2.png",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64ad5e90894b2db31076ce8f/coverArt/LK10FITTFPJ97.png",
    key: "stores/64ad5e90894b2db31076ce8f/coverArt/LK10FITTFPJ97.png",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64ad5e90894b2db31076ce8f/logo/LK10FI5CTC6Q2.png",
    key: "stores/64ad5e90894b2db31076ce8f/logo/LK10FI5CTC6Q2.png",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64ad5e90894b2db31076ce8f/products/64b05066d8a2482778a5a658/LK1JPJ2R19ZZD.jpg",
    key: "stores/64ad5e90894b2db31076ce8f/products/64b05066d8a2482778a5a658/LK1JPJ2R19ZZD.jpg",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64ad5e90894b2db31076ce8f/products/64b05066d8a2482778a5a658/LK1JPJ2Y6BNQV.jpg",
    key: "stores/64ad5e90894b2db31076ce8f/products/64b05066d8a2482778a5a658/LK1JPJ2Y6BNQV.jpg",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64ad5e90894b2db31076ce8f/products/64b05066d8a2482778a5a658/LK1JPTUS8DUS4.jpg",
    key: "stores/64ad5e90894b2db31076ce8f/products/64b05066d8a2482778a5a658/LK1JPTUS8DUS4.jpg",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64ad5e90894b2db31076ce8f/products/64b05066d8a2482778a5a658/LK1JPTV1XNVNS.jpg",
    key: "stores/64ad5e90894b2db31076ce8f/products/64b05066d8a2482778a5a658/LK1JPTV1XNVNS.jpg",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64ad5e90894b2db31076ce8f/products/64b05066d8a2482778a5a658/LK1JS5OCEITD8.jpg",
    key: "stores/64ad5e90894b2db31076ce8f/products/64b05066d8a2482778a5a658/LK1JS5OCEITD8.jpg",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64ad5e90894b2db31076ce8f/products/64b05066d8a2482778a5a658/LK1JS5OEJDCSE.jpg",
    key: "stores/64ad5e90894b2db31076ce8f/products/64b05066d8a2482778a5a658/LK1JS5OEJDCSE.jpg",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64ad5e90894b2db31076ce8f/products/64b05066d8a2482778a5a658/LK1JT12PGFUYA.jpg",
    key: "stores/64ad5e90894b2db31076ce8f/products/64b05066d8a2482778a5a658/LK1JT12PGFUYA.jpg",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64ad5e90894b2db31076ce8f/products/64b05066d8a2482778a5a658/LK1JT12Q6I9AW.jpg         %2BnThRf4G68BQgqCk ",
    key: "stores/64ad5e90894b2db31076ce8f/products/64b05066d8a2482778a5a658/LK1JT12Q6I9AW.jpg",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64aeb79507e4edcfafce7b4f/coverArt/LK2Z3XSVYRCIW.webp         %2BLVa1wcbQA5PA ",
    key: "stores/64aeb79507e4edcfafce7b4f/coverArt/LK2Z3XSVYRCIW.webp",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64aeb79507e4edcfafce7b4f/logo/LK10Q6GFQ3EX4.svg          ",
    key: "stores/64aeb79507e4edcfafce7b4f/logo/LK10Q6GFQ3EX4.svg",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64aeb79507e4edcfafce7b4f/products/64afad39a3897a100b673fb7/LK10GYOVESKFN.jpg         %2FsIB95iHTkc ",
    key: "stores/64aeb79507e4edcfafce7b4f/products/64afad39a3897a100b673fb7/LK10GYOVESKFN.jpg",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64aeb79507e4edcfafce7b4f/products/64afad39a3897a100b673fb7/LK13BNV183BJ6.png          ",
    key: "stores/64aeb79507e4edcfafce7b4f/products/64afad39a3897a100b673fb7/LK13BNV183BJ6.png",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64b044b039a16b0008da6173/coverArt/LK1I2HEM0QNJF.jpg         %2F65sey2Kpq7TDXo ",
    key: "stores/64b044b039a16b0008da6173/coverArt/LK1I2HEM0QNJF.jpg",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64b044b039a16b0008da6173/coverArt/LK1I3TDAC8Z5H.jpg          ",
    key: "stores/64b044b039a16b0008da6173/coverArt/LK1I3TDAC8Z5H.jpg",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64b044b039a16b0008da6173/coverArt/LK1I49RLUFM17.jpg         %2FVGOH9BA ",
    key: "stores/64b044b039a16b0008da6173/coverArt/LK1I49RLUFM17.jpg",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64b044b039a16b0008da6173/logo/LK1I2G1J8TJWY.jpg         %2BXydg6Mj36x3dR59AyOA4 ",
    key: "stores/64b044b039a16b0008da6173/logo/LK1I2G1J8TJWY.jpg",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64b044b039a16b0008da6173/products/64b04aa2a734f60008e6d8c4/LK1J4K96A1B5A.jpg          ",
    key: "stores/64b044b039a16b0008da6173/products/64b04aa2a734f60008e6d8c4/LK1J4K96A1B5A.jpg",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64b044b039a16b0008da6173/products/64b04aa2a734f60008e6d8c4/LK1J4K9UECS2P.jpg         %2F%2FoEpHrjQfHG%2BeHMHVAp%2FuGtQ ",
    key: "stores/64b044b039a16b0008da6173/products/64b04aa2a734f60008e6d8c4/LK1J4K9UECS2P.jpg",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64b044b039a16b0008da6173/products/64b04aa2a734f60008e6d8c4/LK1J4RHRO5DMK.jpg         %2BxChBUOYKeWm03HWBxoeen4 ",
    key: "stores/64b044b039a16b0008da6173/products/64b04aa2a734f60008e6d8c4/LK1J4RHRO5DMK.jpg",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64b044b039a16b0008da6173/products/64b04aa2a734f60008e6d8c4/LK1J4RHYJU8H0.jpg          ",
    key: "stores/64b044b039a16b0008da6173/products/64b04aa2a734f60008e6d8c4/LK1J4RHYJU8H0.jpg",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64b044b039a16b0008da6173/products/64b04aa2a734f60008e6d8c4/LK1J4RIEZRAPG.jpg         %2BRoWEL7iHRt7MEsTa3ND8 ",
    key: "stores/64b044b039a16b0008da6173/products/64b04aa2a734f60008e6d8c4/LK1J4RIEZRAPG.jpg",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64b044b039a16b0008da6173/products/64b04aa2a734f60008e6d8c4/LK1JBBXRRA0RW.jpg          ",
    key: "stores/64b044b039a16b0008da6173/products/64b04aa2a734f60008e6d8c4/LK1JBBXRRA0RW.jpg",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64b044b039a16b0008da6173/products/64b04aa2a734f60008e6d8c4/LK1JBBXX02PWP.jpg         %2Fl%2FDMH69Ik6vsKXpFnmMU ",
    key: "stores/64b044b039a16b0008da6173/products/64b04aa2a734f60008e6d8c4/LK1JBBXX02PWP.jpg",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64b044b039a16b0008da6173/products/64b04aa2a734f60008e6d8c4/LK1JH1PCFD2QT.jpg          ",
    key: "stores/64b044b039a16b0008da6173/products/64b04aa2a734f60008e6d8c4/LK1JH1PCFD2QT.jpg",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64b044b039a16b0008da6173/products/64b04aa2a734f60008e6d8c4/LK1JH1PN1588F.jpg          ",
    key: "stores/64b044b039a16b0008da6173/products/64b04aa2a734f60008e6d8c4/LK1JH1PN1588F.jpg",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64b044b039a16b0008da6173/products/64b04aa2a734f60008e6d8c4/LK1JH1PQWVD4V.jpg          ",
    key: "stores/64b044b039a16b0008da6173/products/64b04aa2a734f60008e6d8c4/LK1JH1PQWVD4V.jpg",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64b044b039a16b0008da6173/products/64b04aa2a734f60008e6d8c4/LK1JH7RQL4R19.jpg         2BkRLsNE%2Bjlg0nCIPpN8QDDMjjWg ",
    key: "stores/64b044b039a16b0008da6173/products/64b04aa2a734f60008e6d8c4/LK1JH7RQL4R19.jpg",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64b044b039a16b0008da6173/products/64b04aa2a734f60008e6d8c4/LK1JH7RW97IPI.jpg          ",
    key: "stores/64b044b039a16b0008da6173/products/64b04aa2a734f60008e6d8c4/LK1JH7RW97IPI.jpg",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64b044b039a16b0008da6173/products/64b04aa2a734f60008e6d8c4/LK1JH7RYZG6ZV.jpg         %2BpOUZfUVk6Yt9W9bAPrw ",
    key: "stores/64b044b039a16b0008da6173/products/64b04aa2a734f60008e6d8c4/LK1JH7RYZG6ZV.jpg",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64b044b039a16b0008da6173/products/64b04aa2a734f60008e6d8c4/LK1JI18GTBE3D.jpg         %2FoDRBpF7jFLVCAfB5hVHE ",
    key: "stores/64b044b039a16b0008da6173/products/64b04aa2a734f60008e6d8c4/LK1JI18GTBE3D.jpg",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64b044b039a16b0008da6173/products/64b04aa2a734f60008e6d8c4/LK1JI18IT4MAG.jpg          ",
    key: "stores/64b044b039a16b0008da6173/products/64b04aa2a734f60008e6d8c4/LK1JI18IT4MAG.jpg",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64b044b039a16b0008da6173/products/64b04aa2a734f60008e6d8c4/LK1JI18L0U8V8.jpg          ",
    key: "stores/64b044b039a16b0008da6173/products/64b04aa2a734f60008e6d8c4/LK1JI18L0U8V8.jpg",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64b044b039a16b0008da6173/products/64b04aa2a734f60008e6d8c4/LK1K50AWGX7NZ.jpg         %2Bpi0ETqEwomDuDQFHSc%2Fyag ",
    key: "stores/64b044b039a16b0008da6173/products/64b04aa2a734f60008e6d8c4/LK1K50AWGX7NZ.jpg",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64b044b039a16b0008da6173/products/64b04aa2a734f60008e6d8c4/LK1K50BFR4E1Q.jpg         %2BRHqDaogTQPFvKgP3HiTg ",
    key: "stores/64b044b039a16b0008da6173/products/64b04aa2a734f60008e6d8c4/LK1K50BFR4E1Q.jpg",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64b044b039a16b0008da6173/products/64b04aa2a734f60008e6d8c4/LK1K6WON2CH8T.jpg         %2BO95bmtdtYkL%2F215vqoZArAU ",
    key: "stores/64b044b039a16b0008da6173/products/64b04aa2a734f60008e6d8c4/LK1K6WON2CH8T.jpg",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64b044b039a16b0008da6173/products/64b04aa2a734f60008e6d8c4/LK1K6WOZIXSQS.jpg          ",
    key: "stores/64b044b039a16b0008da6173/products/64b04aa2a734f60008e6d8c4/LK1K6WOZIXSQS.jpg",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64b044b039a16b0008da6173/products/64b04aa2a734f60008e6d8c4/LK1K6WP3KI60L.jpg          ",
    key: "stores/64b044b039a16b0008da6173/products/64b04aa2a734f60008e6d8c4/LK1K6WP3KI60L.jpg",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64b3de44dfa62c5460dbf65d/coverArt/LK5L28Q8PZLSG.jpg         %2F6O41Et3eCci%2F1WsE3C8dAsXYI ",
    key: "stores/64b3de44dfa62c5460dbf65d/coverArt/LK5L28Q8PZLSG.jpg",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64b3de44dfa62c5460dbf65d/coverArt/LK5L2L09VO5EY.jpg          ",
    key: "stores/64b3de44dfa62c5460dbf65d/coverArt/LK5L2L09VO5EY.jpg",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64b3de44dfa62c5460dbf65d/coverArt/LK5L4EB601WUG.jpg         %2BZNCmJfI5gMuU ",
    key: "stores/64b3de44dfa62c5460dbf65d/coverArt/LK5L4EB601WUG.jpg",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64b3de44dfa62c5460dbf65d/coverArt/LK5L7FBMU0WFV.jpg         2FPJFqviVD5mNymE9jBzooRgxcX4 ",
    key: "stores/64b3de44dfa62c5460dbf65d/coverArt/LK5L7FBMU0WFV.jpg",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64b3de44dfa62c5460dbf65d/logo/LK5G6BT66PBBW.svg         %2BQhPIUmfX4R6UU0F9hJJ0KSwZo ",
    key: "stores/64b3de44dfa62c5460dbf65d/logo/LK5G6BT66PBBW.svg",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64b92fca65cfad0008203d68/coverArt/LKB6WGI50SM8J.png          ",
    key: "stores/64b92fca65cfad0008203d68/coverArt/LKB6WGI50SM8J.png",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64b92fca65cfad0008203d68/logo/LKB6WFQLC8H1W.svg         2FUpQ%2FgXhvIi5E%2BVH1Q9snyoZL6M ",
    key: "stores/64b92fca65cfad0008203d68/logo/LKB6WFQLC8H1W.svg",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64b92fca65cfad0008203d68/products/64b9480444af170008fbfbd8/LKBDGY1IDNAEP.png         %2BiKqqw ",
    key: "stores/64b92fca65cfad0008203d68/products/64b9480444af170008fbfbd8/LKBDGY1IDNAEP.png",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/stores/64b92fca65cfad0008203d68/products/64b9480444af170008fbfbd8/LKBDGY1T9XSNI.png         %2FXhNg53L4FLsVmYekwQ4 ",
    key: "stores/64b92fca65cfad0008203d68/products/64b9480444af170008fbfbd8/LKBDGY1T9XSNI.png",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/useful/         %2BNqlnQG4QQVMj%2FfAWMRxY ",
    key: "useful/",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/useful/backgrounds/         %2FB8Yp4FcC%2FryY%2BO7Z2x66Wc ",
    key: "useful/backgrounds/",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/useful/backgrounds/1.png          ",
    key: "useful/backgrounds/1.png",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/useful/backgrounds/2.png          ",
    key: "useful/backgrounds/2.png",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/useful/backgrounds/3.png         %2BMnwvc ",
    key: "useful/backgrounds/3.png",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/useful/backgrounds/4.png         %2FwL%2BiOhB%2BRJvdlc ",
    key: "useful/backgrounds/4.png",
  },
  {
    location:
      "https://s3.ap-southeast-1.amazonaws.com/cdn.dokan.gg/useful/backgrounds/5.png         %2BTug ",
    key: "useful/backgrounds/5.png",
  },
];
