// config/regions.js
const regionConfigs = {
	
	    '1': {
        id: '1',
        merchantName: '广东联合电子服务股份有限公司',
        merchantFullName: '广东联合电子服务股份有限公司',
        productName: '通行费_',
        productCodePrefix: 'ES010031',
        productCodeAlgorithm: 'datetime_random',
        paymentMethod: '零钱',
        acquirer: '招商银行股份有限公司广东自贸试验区南沙分行',
        clearingService: '由网联清算有限公司提供收款清算服务',
        avatar: 'igs/gdlh.png',
		barcodePrefix: "0022",
        breakPositions: {
            product: 3,
            merchant: 27,
            acquirer: 17,
            clearing: 20
        },
        showProductCode: true
},
    '2': {
        id: '2',
        merchantName: '深圳高速公路集团股份有限公司',
        merchantFullName: '深圳高速公路集团股份有限公司',
        productName: '高速收费(订单号:',
        productCodePrefix: '00081205',
        productCodeAlgorithm: 'date_random',
        paymentMethod: '零钱',
        acquirer: '招商银行股份有限公司',
        clearingService: '由网联清算有限公司提供收款清算服务',
        avatar: 'igs/sz.jpg',
		barcodePrefix: "0022",
        breakPositions: {
            product: 7,
            merchant: 30,
            acquirer: 17,
            clearing: 20
        },
        showProductCode: true
},
    '3': {
        id: '3',
        merchantName: '广西桂梧高速公路建设有限公司',
        merchantFullName: '广西桂梧高速公路建设有限公司',
        productName: '高速通行费',
        productCodePrefix: '',
        productCodeAlgorithm: 'empty',
        paymentMethod: '零钱',
        acquirer: '招商银行股份有限公司',
        clearingService: '由网联清算有限公司提供收款清算服务',
        avatar: 'igs/zsty.png',
		barcodePrefix: "0022",
        breakPositions: {
					product: 25,        // 商品在第25字符换行
					merchant: 30,       // 商户全称在第30字符换行
					acquirer: 18,       // 收单机构在第18字符换行
					clearing: 20,        // 清算服务在第20字符换行
        },
        showProductCode: false
},
	'4': {
        id: '4',
        merchantName: '浙江高速公路投资发展有限公司',
        merchantFullName: '浙江高速公路投资发展有限公司',
        productName: '浙江高速:  ',
        productCodePrefix: '',
        productCodeAlgorithm: 'empty',
        paymentMethod: '零钱',
        acquirer: '中国邮政储蓄银行股份有限公司浙江省分行',
        clearingService: '由中国银联股份有限公司提供收款清算服务',
        avatar: 'igs/zgyzcx.jpg',
		barcodePrefix: "95516000",
        breakPositions: {
					product: 25,        // 商品在第25字符换行
					merchant: 30,       // 商户全称在第30字符换行
					acquirer: 17,       // 收单机构在第18字符换行
					clearing: 17,        // 清算服务在第20字符换行
        },
        showProductCode: false     // true显示商品代码，false不显示
},
	'5': {
        id: '5',
        merchantName: '河南省高速公路联网监控收费通信服务有限公司',
        merchantFullName: '河南省高速公路联网监控收费通信服务有限公司',
        productName: '高速通行费',
        productCodePrefix: '',
        productCodeAlgorithm: 'empty',
        paymentMethod: '零钱',
        acquirer: '财付通支付科技有限公司',
        clearingService: '由网联清算有限公司提供收款清算服务',
        avatar: 'igs/tvv.jpg',
		barcodePrefix: "0022",
        breakPositions: {
					product: 25,        // 商品在第25字符换行
					merchant: 17,       // 商户全称在第30字符换行
					acquirer: 17,       // 收单机构在第18字符换行
					clearing: 17        // 清算服务在第20字符换行
        },
        showProductCode: false
},
	'6': {
        id: '6',
        merchantName: '四川智能交通系统管理有限公司',
        merchantFullName: '四川智能交通系统管理有限公司',
        productName: '高速通行费',
        productCodePrefix: '',
        productCodeAlgorithm: 'empty',
        paymentMethod: '零钱',
        acquirer: '中国工商银行股份有限公司牡丹卡中心',
        clearingService: '由中国银联股份有限公司提供收款清算服务',
        avatar: 'igs/sichuan.jpg',
		barcodePrefix: "44024784000",
        breakPositions: {
					product: 25,        // 商品在第25字符换行
					merchant: 17,       // 商户全称在第30字符换行
					acquirer: 17,       // 收单机构在第18字符换行
					clearing: 17        // 清算服务在第20字符换行
        },
        showProductCode: false
},
	'7': {
        id: '7',
        merchantName: '河北交投智能',
        merchantFullName: '河北交投智能科技股份有限公司',
        productName: '河北省高速公路联网收费中心',
        productCodePrefix: '',
        productCodeAlgorithm: 'empty',
        paymentMethod: '零钱',
        acquirer: '财付通支付科技有限公司',
        clearingService: '由网联清算有限公司提供收款清算服务',
        avatar: 'igs/hbzt.jpg',
		barcodePrefix: "0022",
        breakPositions: {
					product: 25,        // 商品在第25字符换行
					merchant: 17,       // 商户全称在第30字符换行
					acquirer: 17,       // 收单机构在第18字符换行
					clearing: 17        // 清算服务在第20字符换行
        },
        showProductCode: false
},
	'8': {
        id: '8',
        merchantName: '湖南省高速公路联网收费管理有限公司',
        merchantFullName: '湖南省高速公路联网收费管理有限公司',
        productName: '高速通行费',
        productCodePrefix: '',
        productCodeAlgorithm: 'empty',
        paymentMethod: '零钱',
        acquirer: '招商银行股份有限公司',
        clearingService: '由中国银联股份有限公司提供收款清算服务',
        avatar: 'igs/hunan.jpg',
		barcodePrefix: "0022",
        breakPositions: {
           			product: 25,        // 商品在第25字符换行
					merchant: 30,       // 商户全称在第30字符换行
					acquirer: 18,       // 收单机构在第18字符换行
					clearing: 18        // 清算服务在第20字符换行
        },
        showProductCode: false
},
	'9': {
        id: '9',
        merchantName: '湖北省高速公路联网收费中心',
        merchantFullName: '湖北省高速公路联网收费中心',
        productName: '湖北省高速公路联网收费中心',
        productCodePrefix: '',
        productCodeAlgorithm: 'empty',
        paymentMethod: '零钱',
        acquirer: '银联商务股份有限公司',
        clearingService: '由中国银联股份有限公司提供收款清算服务',
        avatar: 'igs/ah.png',
		barcodePrefix: "0022",
        breakPositions: {
					product: 25,        // 商品在第25字符换行
					merchant: 30,       // 商户全称在第30字符换行
					acquirer: 17,       // 收单机构在第18字符换行
					clearing: 17        // 清算服务在第20字符换行
        },
        showProductCode: false
},
	'10': {
        id: '10',
        merchantName: '福建省高速公路集团有限公司电子收费管理中心',
        merchantFullName: '福建省高速公路集团有限公司',
        productName: '福建高速公路-通行费',
        productCodePrefix: '',
        productCodeAlgorithm: 'empty',
        paymentMethod: '零钱',
        acquirer: '财付通支付科技有限公司',
        clearingService: '由网联清算有限公司提供收款清算服务',
        avatar: 'igs/fj.jpg',
		barcodePrefix: "0022",
        breakPositions: {
					product: 25,        // 商品在第25字符换行
					merchant: 30,       // 商户全称在第30字符换行
					acquirer: 18,       // 收单机构在第18字符换行
					clearing: 20        // 清算服务在第20字符换行
        },
        showProductCode: false
},
	'11': {
        id: '11',
        merchantName: '安徽省高速公路联网运营有限公司',
        merchantFullName: '安徽省高速公路联网运营有限公司',
        productName: '安徽省高速公路联网运营有限公司',
        productCodePrefix: '',
        productCodeAlgorithm: 'empty',
        paymentMethod: '零钱',
        acquirer: '银联商务支付股份有限公司',
        clearingService: '由中国银联股份有限公司提供收款清算服务',
        avatar: 'igs/ah.png',
		barcodePrefix: "0022",
        breakPositions: {
					product: 25,        // 商品在第25字符换行
					merchant: 30,       // 商户全称在第30字符换行
					acquirer: 18,       // 收单机构在第18字符换行
					clearing: 17        // 清算服务在第20字符换行
        },
        showProductCode: false
},
	'12': {
        id: '12',
        merchantName: '辽宁高速',
        merchantFullName: '辽宁省高速公路运营管理有限责任公司',
        productName: '高速通行费',
        productCodePrefix: '',
        productCodeAlgorithm: 'empty',
        paymentMethod: '零钱',
        acquirer: '财付通支付科技有限公司',
        clearingService: '由网联清算有限公司提供收款清算服务',
        avatar: 'igs/lllnnn.jpg',
		barcodePrefix: "0022",
        breakPositions: {
					product: 25,       
					merchant: 30,      
					acquirer: 18,     
					clearing: 20,      
        },
        showProductCode: false
},
	'13': {
        id: '13',
        merchantName: '陕西交通控股集团有限公司',
        merchantFullName: '陕西交通控股集团有限公司',
        productName: '车牌号于XXXX年XX月XX日XX时XX分通过收费站名支付通行费X元',
        productCodePrefix: '',
        productCodeAlgorithm: 'empty',
        paymentMethod: '零钱',
        acquirer: '招商银行股份有限公司',
        clearingService: '由中国银联股份有限公司提供收款清算服务',
        avatar: 'igs/zsty.png',
		barcodePrefix: "0022",
        breakPositions: {
            product: 25,
            merchant: 14,
            acquirer: 17,
            clearing: 17
        },
        showProductCode: false
},
	'14': {
        id: '14',
        merchantName: '江西省交通监控指挥中心',
        merchantFullName: '江西省交通监控指挥中心',
        productName: '高速通行费',
        productCodePrefix: '',
        productCodeAlgorithm: 'empty',
        paymentMethod: '零钱',
        acquirer: '招商银行股份有限公司',
        clearingService: '由中国银联股份有限公司提供收款清算服务',
        avatar: 'igs/jx.png',
		barcodePrefix: "95516000",
        breakPositions: {
					product: 25,        // 商品在第25字符换行
					merchant: 17,       // 商户全称在第30字符换行
					acquirer: 17,       // 收单机构在第18字符换行
					clearing: 17        // 清算服务在第20字符换行
        },
        showProductCode: false
},
	'15': {
        id: '15',
        merchantName: '联网公司',
        merchantFullName: '云南公路联网收费管理有限公司',
        productName: '高速通行费',
        productCodePrefix: '',
        productCodeAlgorithm: 'empty',
        paymentMethod: '零钱',
        acquirer: '财付通支付科技有限公司',
        clearingService: '由网联清算有限公司提供收款清算服务',
        avatar: 'igs/ynsss.png',
		barcodePrefix: "0022",
        breakPositions: {
					product: 25,        // 商品在第25字符换行
					merchant: 30,       // 商户全称在第30字符换行
					acquirer: 18,       // 收单机构在第18字符换行
					clearing: 20        // 清算服务在第20字符换行
        },
        showProductCode: false
},
	'16': {
        id: '16',
        merchantName: '山东高速集团',
        merchantFullName: '山东高速集团有限公司电子收费分公司',
        productName: '通行费',
        productCodePrefix: '',
        productCodeAlgorithm: 'empty',
        paymentMethod: '零钱',
        acquirer: '财付通支付科技有限公司',
        clearingService: '由网联清算有限公司提供收款清算服务',
        avatar: 'igas/sdgg.jpg',
		barcodePrefix: "061016120",
        breakPositions: {
            product: 25,
            merchant: 30,
            acquirer: 18,
            clearing: 17
        },
        showProductCode: false
},
	'17': {
        id: '17',
        merchantName: '黑龙江省收费公路联网运营结算中心',
        merchantFullName: '黑龙江省交通运输信息和科学研究中心(黑龙江省收费公路联网运营结算中心)',
        productName: '黑龙江省交通信息中心-消费',
        productCodePrefix: '',
        productCodeAlgorithm: 'empty',
        paymentMethod: '零钱',
        acquirer: '中国建设银行股份有限公司深圳市分行',
        clearingService: '由网联清算有限公司提供收款清算服务',
        avatar: 'igs/bcb.jpg',
		barcodePrefix: "0022",
        breakPositions: {
					product: 25,        // 商品在第25字符换行
					merchant: 17,       // 商户全称在第30字符换行
					acquirer: 18,       // 收单机构在第18字符换行
					clearing: 20        // 清算服务在第20字符换行
        },
        showProductCode: false
},
	'18': {
        id: '18',
        merchantName: '山西高速ETC运营服务中心',
        merchantFullName: '山西省交通信息通信有限公司不停车收费运营服务中心',
        productName: '高速通行费',
        productCodePrefix: '',
        productCodeAlgorithm: 'empty',
        paymentMethod: '零钱',
        acquirer: '兴业银行股份有限公司',
        clearingService: '由中国银联股份有限公司提供收款清算服务',
        avatar: 'igs/sxx.jpg',
		barcodePrefix: "0022",
        breakPositions: {
					product: 25,        // 商品在第25字符换行
					merchant: 17,       // 商户全称在第30字符换行
					acquirer: 17,       // 收单机构在第18字符换行
					clearing: 17        // 清算服务在第20字符换行
        },
        showProductCode: false
},
	'19': {
        id: '19',
        merchantName: '黔通智联高速通行',
        merchantFullName: '贵州黔通智联科技股份有限公司',
        productName: '高速通行费',
        productCodePrefix: '',
        productCodeAlgorithm: 'empty',
        paymentMethod: '零钱',
        acquirer: '财付通支付科技有限公司',
        clearingService: '由网联清算有限公司提供收款清算服务',
        avatar: 'igs/qiantx.jpg',
		barcodePrefix: "PRO20",
        breakPositions: {
            product: 25,
            merchant: 17,
            acquirer: 17,
            clearing: 17
        },
        showProductCode: false
},
	'20': {
        id: '20',
        merchantName: '吉林省奇展投资管理有限公司',
        merchantFullName: '吉林省奇展投资管理有限公司',
        productName: '吉林省奇展投资管理有限公司高速收费站-消费',
        productCodePrefix: '',
        productCodeAlgorithm: 'empty',
        paymentMethod: '零钱',
        acquirer: '中国建设银行股份有限公司深圳市分行',
        clearingService: '由网联清算有限公司提供收款清算服务',
        avatar: 'igs/js.png',
		barcodePrefix: "42002601",
        breakPositions: {
            product: 17,
            merchant: 17,
            acquirer: 17,
            clearing: 17
        },
        showProductCode: false
},
	'21': {
        id: '21',
        merchantName: '甘肃省高速公路联网收费清分结算中心',
        merchantFullName: '甘肃省高速公路联网收费清分结算中心',
        productName: '高速通行费',
        productCodePrefix: '',
        productCodeAlgorithm: 'empty',
        paymentMethod: '零钱',
        acquirer: '财付通支付科技有限公司',
        clearingService: '由网联清算有限公司提供收款清算服务',
        avatar: 'igs/tvv.jpg',
		barcodePrefix: "0022",
        breakPositions: {
            product: 17,
            merchant: 17,
            acquirer: 17,
            clearing: 17
        },
        showProductCode: false
},
	'22': {
        id: '22',
        merchantName: '上海耐特高速公路收费结算有限公司',
        merchantFullName: '上海耐特高速公路收费结算有限公司',
        productName: '手持机微信支付收款',
        productCodePrefix: '',
        productCodeAlgorithm: 'empty',
        paymentMethod: '零钱',
        acquirer: '上海浦东发展银行股份有限公司深圳分行',
        clearingService: '由中国银联股份有限公司提供收款清算服务',
        avatar: 'igs/pf.png',
		barcodePrefix: "19011110",
        breakPositions: {
            product: 17,
            merchant: 17,
            acquirer: 17,
            clearing: 17
        },
        showProductCode: false
},
	'23': {
        id: '23',
        merchantName: '内蒙古自治区交通运输综合行政执法总队',
        merchantFullName: '内蒙古自治区交通运输综合行政执法总队',
        productName: '高速通行费',
        productCodePrefix: '',
        productCodeAlgorithm: 'empty',
        paymentMethod: '零钱',
        acquirer: '通联支付网络服务股份有限公司',
        clearingService: '由中国银联股份有限公司提供收款清算服务',
        avatar: 'igs/hb.png',
		barcodePrefix: "0022",
        breakPositions: {
            product: 17,
            merchant: 17,
            acquirer: 17,
            clearing: 17
        },
        showProductCode: false
},
	'24': {
        id: '24',
        merchantName: '通行宝',
        merchantFullName: '江苏通行宝智慧交通科技股份有限公司',
        productName: '高速通行费',
        productCodePrefix: '',
        productCodeAlgorithm: 'empty',
        paymentMethod: '零钱',
        acquirer: '银联商务支付股份有限公司',
        clearingService: '由中国银联股份有限公司提供收款清算服务',
        avatar: 'igs/jst.png',
		barcodePrefix: "20",
        breakPositions: {
            product: 17,
            merchant: 17,
            acquirer: 17,
            clearing: 17
        },
        showProductCode: false
},
	'25': {
        id: '25',
        merchantName: '北京速通科技有限公司',
        merchantFullName: '北京速通科技有限公司',
        productName: '高速被扫支付',
        productCodePrefix: '',
        productCodeAlgorithm: 'empty',
        paymentMethod: '零钱',
        acquirer: '财付通支付科技有限公司',
        clearingService: '由网联清算有限公司提供收款清算服务',
        avatar: 'igs/bj.png',
		barcodePrefix: "0022",
        breakPositions: {
            product: 17,
            merchant: 17,
            acquirer: 17,
            clearing: 17
        },
        showProductCode: false
},
	'26': {
        id: '26',
        merchantName: '天津高速移动支付',
        merchantFullName: '天津高速路网运营管理有限公司',
        productName: '高速通行费',
        productCodePrefix: '',
        productCodeAlgorithm: 'empty',
        paymentMethod: '零钱',
        acquirer: '财付通支付科技有限公司',
        clearingService: '由网联清算有限公司提供收款清算服务',
        avatar: 'igs/tj.png',
		barcodePrefix: "0022",
        breakPositions: {
					product: 25,        // 商品在第25字符换行
					merchant: 30,       // 商户全称在第30字符换行
					acquirer: 18,       // 收单机构在第18字符换行
					clearing: 20        // 清算服务在第20字符换行
        },
        showProductCode: false
},
	'27': {
        id: '27',
        merchantName: '通渝卡公众服务',
        merchantFullName: '重庆通渝科技有限公司',
        productName: '重庆高速通行费- XX站_XX站  ',
        productCodePrefix: '',
        productCodeAlgorithm: 'empty',
        paymentMethod: '零钱',
        acquirer: '财付通支付科技有限公司',
        clearingService: '由网联清算有限公司提供收款清算服务',
        avatar: 'igs/cq0.png',
		barcodePrefix: "0022",
        breakPositions: {
            product: 17,
            merchant: 17,
            acquirer: 17,
            clearing: 17
        },
        showProductCode: false
},
	'28': {
        id: '28',
        merchantName: '海南省交通规费征稽局',
        merchantFullName: '海南省交通规费征稽局',
        productName: '海南省交通规费征稽局-消费',
        productCodePrefix: '',
        productCodeAlgorithm: 'empty',
        paymentMethod: '零钱',
        acquirer: '中国建设银行股份有限公司深圳市分行',
        clearingService: '由网联清算有限公司提供付款清算服务',
        avatar: 'igs/hnnn.png',
		barcodePrefix: "0022",
        breakPositions: {
					product: 25,        // 商品在第25字符换行
					merchant: 30,       // 商户全称在第30字符换行
					acquirer: 18,       // 收单机构在第18字符换行
					clearing: 20        // 清算服务在第20字符换行
        },
        showProductCode: false
},
	'29': {
        id: '29',
        merchantName: '宁夏交投高速公路管理有限公司',
        merchantFullName: '宁夏交投高速公路管理有限公司',
        productName: '宁夏交投高速公路管理有限公司-消费',
        productCodePrefix: '',
        productCodeAlgorithm: 'empty',
        paymentMethod: '零钱',
        acquirer: '中国建设银行股份有限公司深圳市分行',
        clearingService: '由网联清算有限公司提供收款清算服务',
        avatar: 'igs/js.png',
		barcodePrefix: "0022",
        breakPositions: {
					product: 17,       
					merchant: 17,      
					acquirer: 17,     
					clearing: 17,      
        },
        showProductCode: false
},
	'30': {
        id: '30',
        merchantName: '青海省高速公路运营管理有限公司',
        merchantFullName: '青海省高速公路运营管理有限公司',
        productName: '高速通行费',
        productCodePrefix: '',
        productCodeAlgorithm: 'empty',
        paymentMethod: '零钱',
        acquirer: '财付通支付科技有限公司',
        clearingService: '由网联清算有限公司提供收款清算服务',
        avatar: 'igs/tvccc.jpg',
		barcodePrefix: "0022",
        breakPositions: {
            product: 17,
            merchant: 17,
            acquirer: 17,
            clearing: 17
        },
        showProductCode: false
},
	'31': {
        id: '31',
        merchantName: '浙江高速公路投资发展有限公司',
        merchantFullName: '浙江高速公路投资发展有限公司',
        productName: '浙江高速:   ',
        productCodePrefix: '',
        productCodeAlgorithm: 'empty',
        paymentMethod: '零钱',
        acquirer: '财付通支付科技有限公司',
        clearingService: '由网联清算有限公司提供收款清算服务',
        avatar: 'igs/zgyzcx.jpg',
		barcodePrefix: "9516000",
        breakPositions: {
            product: 17,
            merchant: 17,
            acquirer: 17,
            clearing: 17
        },
        showProductCode: false
},
	'32': {
        id: '32',
        merchantName: '浙江高速公路投资发展有限公司',
        merchantFullName: '浙江高速公路投资发展有限公司',
        productName: '浙江高速:   ',
        productCodePrefix: '',
        productCodeAlgorithm: 'empty',
        paymentMethod: '零钱',
        acquirer: '财付通支付科技有限公司',
        clearingService: '由网联清算有限公司提供收款清算服务',
        avatar: 'igs/zgyzcx.jpg',
		barcodePrefix: "9516000",
        breakPositions: {
            product: 17,
            merchant: 17,
            acquirer: 17,
            clearing: 17
        },
        showProductCode: false
},
	'33': {
        id: '33',
        merchantName: '浙江高速公路投资发展有限公司',
        merchantFullName: '浙江高速公路投资发展有限公司',
        productName: '浙江高速:   ',
        productCodePrefix: '',
        productCodeAlgorithm: 'empty',
        paymentMethod: '零钱',
        acquirer: '财付通支付科技有限公司',
        clearingService: '由网联清算有限公司提供收款清算服务',
        avatar: 'igs/zgyzcx.jpg',
		barcodePrefix: "9516000",
        breakPositions: {
            product: 17,
            merchant: 17,
            acquirer: 17,
            clearing: 17
        },
        showProductCode: false
},
	'34': {
        id: '34',
        merchantName: '浙江高速公路投资发展有限公司',
        merchantFullName: '浙江高速公路投资发展有限公司',
        productName: '浙江高速:   ',
        productCodePrefix: '',
        productCodeAlgorithm: 'empty',
        paymentMethod: '零钱',
        acquirer: '财付通支付科技有限公司',
        clearingService: '由网联清算有限公司提供收款清算服务',
        avatar: 'igs/zgyzcx.jpg',
		barcodePrefix: "9516000",
        breakPositions: {
            product: 17,
            merchant: 17,
            acquirer: 17,
            clearing: 17
        },
        showProductCode: false
},
	'35': {
        id: '35',
        merchantName: '浙江高速公路投资发展有限公司',
        merchantFullName: '浙江高速公路投资发展有限公司',
        productName: '浙江高速:   ',
        productCodePrefix: '',
        productCodeAlgorithm: 'empty',
        paymentMethod: '零钱',
        acquirer: '财付通支付科技有限公司',
        clearingService: '由网联清算有限公司提供收款清算服务',
        avatar: 'igs/zgyzcx.jpg',
		barcodePrefix: "9516000",
        breakPositions: {
            product: 17,
            merchant: 17,
            acquirer: 17,
            clearing: 17
        },
        showProductCode: false
},
	'36': {
        id: '36',
        merchantName: '浙江高速公路投资发展有限公司',
        merchantFullName: '浙江高速公路投资发展有限公司',
        productName: '浙江高速:   ',
        productCodePrefix: '',
        productCodeAlgorithm: 'empty',
        paymentMethod: '零钱',
        acquirer: '中国邮政储蓄银行股份有限公司浙江省分行',
        clearingService: '由中国银联股份有限公司提供收款清算服务',
        avatar: 'igs/zgyzcx.jpg',
		barcodePrefix: "9516000",
        breakPositions: {
            product: 17,
            merchant: 17,
            acquirer: 17,
            clearing: 17
        },
        showProductCode: false
    }
};