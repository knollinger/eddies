var DateTimeUtils = (function() {

    var monthAsShortString = [ "Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez" ];
    var monthAsLongString = [ "Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember" ];
    var daysAsShortString = [ "So", "Mo", "Di", "Mi", "Do", "Fr", "Sa" ];
    var daysAsLongString = [ "Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag" ];

    return {

	/**
	 * 
	 * 
	 */
	formatDate : function(date, format) {

	    var result = format;

	    date = new Date(date);
	    result = result.replace("{DD}", daysAsLongString[date.getDay()]);
	    result = result.replace("{D}", daysAsShortString[date.getDay()]);
	    result = result.replace("{dd}", DateTimeUtils.formatNumber(2, date.getDate()));
	    result = result.replace("{d}", date.getDate());
	    result = result.replace("{M}", monthAsShortString[date.getMonth()]);
	    result = result.replace("{MM}", monthAsLongString[date.getMonth()]);
	    result = result.replace("{mm}", DateTimeUtils.formatNumber(2, date.getMonth() + 1));
	    result = result.replace("{m}", date.getMonth() + 1);
	    result = result.replace("{yyyy}", date.getFullYear());
	    result = result.replace("{w}", DateTimeUtils.getWeekOfYear(date));
	    return result;
	},

	formatTime : function(time, format) {

	    var date = new Date(time);
	    var result = format;
	    result = result.replace("{hh}", DateTimeUtils.formatNumber(2, date.getHours()));
	    result = result.replace("{h}", date.getHours());
	    result = result.replace("{mm}", DateTimeUtils.formatNumber(2, date.getMinutes()));
	    result = result.replace("{m}", date.getMinutes());
	    result = result.replace("{ss}", DateTimeUtils.formatNumber(2, date.getSeconds()));
	    result = result.replace("{s}", date.getSeconds());
	    return result;
	},

	/**
	 * Teste, ob es sich beim angegebenen Datum um heute handelt
	 * 
	 * @param date
	 * @returns {Boolean}
	 */
	isToday : function(date) {

	    var today = new Date();
	    return (date.getFullYear() == today.getFullYear() && date.getMonth() == today.getMonth() && date.getDate() == today.getDate());
	},

	/**
	 * parse einen Datums-String unter beachtung des angegebenen
	 * Format-Strings
	 * 
	 * @param input
	 *                Der zu parsende String
	 * 
	 * @param format
	 *                Der Format-String
	 * 
	 * @returns {Date}
	 */
	parseDate : function(input, format) {

	    format = format || 'yyyy-mm-dd'; // default format

	    var parts = input.match(/(\d+)/g), i = 0, fmt = {};

	    var i = 0;
	    format.replace(/(yyyy|dd|mm)/g, function(part) {
		fmt[part] = i++;
	    });

	    var year = Number(parts[fmt['yyyy']]);
	    var month = Number(parts[fmt['mm']]) - 1;
	    var day = Number(parts[fmt['dd']]);
	    var result = new Date(year, month, day);
	    return result;
	},

	/**
	 * parse eine Zeitangabe
	 */
	parseTime : function(input, format) {

	    format = format || 'hh:mm:ss'; // default format

	    var parts = input.match(/(\d+)/g), i = 0, fmt = {};

	    var i = 0;
	    format.replace(/(hh|mm|ss)/g, function(part) {
		fmt[part] = i++;
	    });

	    var result = null;
	    if (parts) {
		var hours = Number(parts[fmt['hh']]);
		var minutes = Number(parts[fmt['mm']]);
		var seconds = Number(parts[fmt['ss']]);

		result = new Date();
		result.setHours(parseInt(hours, 10) || 0);
		result.setMinutes(parseInt(minutes, 10) || 0);
		result.setSeconds(parseInt(seconds, 10) || 0);
	    }
	    return result;
	},

	/**
	 * Berechne die Kalenderwoche eines Datums
	 * 
	 * @param date
	 */
	getWeekOfYear : function(date) {

	    var dayOfYear = DateTimeUtils.getDayOfYear(date);
	    return Math.ceil(dayOfYear / 7);
	},

	/**
	 * Berechne den Tag im Jahr
	 * 
	 * @param date
	 * @returns {Number}
	 */
	getDayOfYear : function(date) {

	    var firstJanuary = new Date(date.getFullYear(), 0, 1);
	    var dayOfYear = ((date - firstJanuary + 86400000) / 86400000);
	    return dayOfYear;
	},

	isDate : function(date) {

	    var dateReg = /^\d{1,2}.\d{1,2}.\d{4}$/;
	    return date.match(dateReg);

	},

	isTime : function(time) {

	    var dateReg = /^0[0-9]|1[0-9]|2[0-3]|[0-5][0-9]/g;
	    return time.match(dateReg).length == 2;

	},

	milliesSinceMidnight : function(date) {

	    var midnight = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
	    return date - midnight;
	},

	normalizeDayOfWeek : function(date) {

	    var day = date.getDay();
	    if (day == 0) {
		day = 7;
	    }
	    return day - 1;

	},

	shortDayName : function(day) {

	    return daysAsShortString[day % 7];
	},

	/**
	 * 
	 */
	formatNumber : function(digits, value) {

	    var result = "" + value;
	    while (result.length < digits) {
		result = "0" + result;
	    }
	    return result;
	}
    }
})();