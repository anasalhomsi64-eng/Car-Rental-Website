/* وظائف التحقق من البيانات وإظهار التفاصيل وحساب تكلفة الاستئجار */
$(document).ready(function () {
    $(".detail-toggle").on("change", function () {
        var detailId = "info-" + $(this).attr("id");
        $("#" + detailId).stop(true, true).slideToggle(180);
    });

    $("#continueButton").on("click", function () {
        if ($(".car-select:checked").length === 0) {
            alert("يرجى اختيار سيارة واحدة على الأقل قبل المتابعة.");
            return;
        }
        $("#bookingSection").slideDown(250);
        $("html, body").animate({ scrollTop: $("#bookingSection").offset().top - 15 }, 350);
    });

    $("#bookingForm").on("submit", function (event) {
        event.preventDefault();

        var selectedCars = [];
        $(".car-select:checked").each(function () {
            selectedCars.push($(this).val());
        });

        if (selectedCars.length === 0) {
            showError("يرجى اختيار سيارة واحدة على الأقل.");
            return;
        }

        var fullName = $.trim($("#fullName").val());
        var nationalId = $.trim($("#nationalId").val());
        var startDate = $("#startDate").val();
        var endDate = $("#endDate").val();
        var mobile = $.trim($("#mobile").val());
        var email = $.trim($("#email").val());

        if (fullName !== "" && !/^[\u0621-\u064A\u0622\u0623\u0625\u0624\u0626\u0629\u0640 ]+$/.test(fullName)) {
            showError("الاسم الكامل يجب أن يحتوي على أحرف عربية ومسافات فقط.");
            return;
        }

        if (!/^(0[1-9]|1[0-4])[0-9]{9}$/.test(nationalId)) {
            showError("الرقم الوطني يجب أن يتكون من 11 رقماً، وأن يبدأ برمز محافظة من 01 إلى 14.");
            return;
        }

        if (startDate === "" || endDate === "") {
            showError("يرجى إدخال تاريخ البداية وتاريخ النهاية.");
            return;
        }

        /* input type=date supplies yyyy-mm-dd; UTC avoids daylight-saving calculation errors. */
        if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
            showError("صيغة التاريخ المطلوبة هي yyyy-mm-dd.");
            return;
        }

        var startParts = startDate.split("-");
        var endParts = endDate.split("-");
        var startUTC = Date.UTC(Number(startParts[0]), Number(startParts[1]) - 1, Number(startParts[2]));
        var endUTC = Date.UTC(Number(endParts[0]), Number(endParts[1]) - 1, Number(endParts[2]));
        var startCheck = new Date(startUTC);
        var endCheck = new Date(endUTC);

        if (startCheck.getUTCFullYear() !== Number(startParts[0]) ||
            startCheck.getUTCMonth() !== Number(startParts[1]) - 1 ||
            startCheck.getUTCDate() !== Number(startParts[2]) ||
            endCheck.getUTCFullYear() !== Number(endParts[0]) ||
            endCheck.getUTCMonth() !== Number(endParts[1]) - 1 ||
            endCheck.getUTCDate() !== Number(endParts[2])) {
            showError("أحد التاريخين غير صالح.");
            return;
        }

        if (endUTC <= startUTC) {
            showError("يجب أن يكون تاريخ النهاية بعد تاريخ البداية.");
            return;
        }

        if (mobile !== "" && !/^09(3|4|5|6|8|9)[0-9]{7}$/.test(mobile)) {
            showError("رقم الموبايل يجب أن يتكون من 10 أرقام ويبدأ بأحد الرموز 093 أو 094 أو 095 أو 096 أو 098 أو 099.");
            return;
        }

        if (email !== "" && !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
            showError("يرجى إدخال بريد إلكتروني صحيح.");
            return;
        }

        var rentalDays = Math.round((endUTC - startUTC) / 86400000);
        var totalBeforeDiscount = 0;
        var rows = "";

        for (var i = 0; i < selectedCars.length; i++) {
            var code = selectedCars[i];
            var row = $("input.car-select[value='" + code + "']").closest("tr");
            var model = row.find("td").eq(2).text();
            var dailyPrice = Number(row.find(".price").text());
            var carTotal = dailyPrice * rentalDays;
            totalBeforeDiscount += carTotal;
            rows += "<tr><td>" + code + "</td><td>" + model + "</td><td>" +
                rentalDays + "</td><td>" + dailyPrice.toLocaleString("en-US") +
                "</td><td>" + carTotal.toLocaleString("en-US") + "</td></tr>";
        }

        var discount = rentalDays > 10 ? totalBeforeDiscount * 0.05 : 0;
        var finalTotal = totalBeforeDiscount - discount;

        var resultHTML = "<h3>تم التحقق من البيانات بنجاح</h3>" +
            "<p>عدد أيام الاستئجار: <strong>" + rentalDays + "</strong> يوم</p>" +
            "<p>السيارات المختارة:</p>" +
            "<table><thead><tr><th>الرمز</th><th>السيارة</th><th>الأيام</th><th>السعر اليومي (ل.س)</th><th>المجموع (ل.س)</th></tr></thead>" +
            "<tbody>" + rows + "</tbody></table>" +
            "<p>المجموع قبل الخصم: <strong>" + totalBeforeDiscount.toLocaleString("en-US") + " ل.س</strong></p>" +
            "<p>الخصم: <strong>" + discount.toLocaleString("en-US") + " ل.س</strong>" +
            (rentalDays > 10 ? " (5%)" : " (لا يوجد؛ مدة الاستئجار لا تتجاوز 10 أيام)") + "</p>" +
            "<p>المبلغ النهائي: <strong>" + finalTotal.toLocaleString("en-US") + " ل.س</strong></p>";

        $("#result").removeClass("error-message").html(resultHTML).fadeIn(250);
    });

    $("#bookingForm").on("reset", function () {
        $("#result").hide().empty();
    });
});

function showError(message) {
    $("#result").addClass("error-message").html(message).fadeIn(200);
}
