function CalcMorg(startingBal, prin, rate, payment, minPayment, constPrinPayment, maxRatio, maxRatioWithPmi, pmi, taxes, valueIncrease, inflation, logging) {
	
    var pmiStart = pmi;
    var pmiMonth = 0;
    var pmiPaid = 0;
    var adjustedPmiPaid = 0;
    var taxesPaid = 0;
    var adjustedTaxesPaid = 0;
    var mInt = 0;
    var month = 0;
    var totalInt = 0;
    var totPay = 0;
    var adjustedPayment = 0;
    var adjustedTotalInt = 0;
    var adjustedTotPay = 0;
    var dollarValue = 1;
    var homeValue = startingBal;
	var infinte = false;
	
	if (startingBal == 0){
		startingBal = prin;
	}
	if (prin == 0){
		prin = startingBal;
	}
    if (payment < minPayment) {
        payment = minPayment;
    }

    console.log("Starting home value: ", homeValue);
    console.log("Starting loan value: ", prin);
    if (constPrinPayment > 0) {
        console.log(`cont prin payment of ${(constPrinPayment).toFixed(2)}`);
    }
    else {
        console.log(`payment of ${(payment).toFixed(2)}`);
    }
    if ((maxRatio > 0) && (payment > minPayment)) {
        console.log(`max ratio of principal to interest payment: ${(maxRatio * 100).toFixed(1)}%`);
    }

	if (inflation >0 || valueIncrease >0){
        console.log(`Inflation at ${(inflation).toFixed(1)}%, and house value increase at ${(valueIncrease).toFixed(1)}%`);
    }

    while (prin > 0) {
        month += 1;
        new_mInt = (prin * rate) / (100 * 12.0);

        if (constPrinPayment > 0) {
            payment = constPrinPayment + new_mInt + taxes + pmi;
        }
        if (maxRatio != 0) {
            if ((maxRatioWithPmi > 0) && (pmi > 0)) {
                if (payment * (1-maxRatioWithPmi) > new_mInt) {
                    payment = new_mInt / (1-maxRatioWithPmi);
                }
            }
            else if (payment * (1 - maxRatio) > new_mInt) {
                payment = new_mInt / (1 - maxRatio);
            }
        }

        if (payment < minPayment) {
            payment = minPayment;
        }
		
		if ((prin+mInt+taxes+pmi)< payment){
            payment = prin + mInt + taxes + pmi;
		}

        diff = mInt - new_mInt;
        mInt = new_mInt;
        totalInt += mInt;
        adjustedTotalInt += mInt * dollarValue;
        adjustedPayment = payment * dollarValue;
        taxesPaid += taxes;
        adjustedTaxesPaid += taxes * dollarValue;

        if (logging) {
            console.log("Month: ", month);
            console.log(`payment of: ${(payment).toFixed(2)}, adj: ${(adjustedPayment).toFixed(2)}`);
            console.log(`interest: ${(mInt).toFixed(2)}, adj: ${(mInt * dollarValue).toFixed(2)}`);

            if (diff > 0) {
                console.log(`interest decreased by: ${(diff).toFixed(2)}`);
            }
        }

		var oldPrin = prin;
        totPay += payment;
        adjustedTotPay += adjustedPayment;
        prin -= payment;
        prin += mInt;
        prin += taxes;
        prin += pmi;
		
		if (prin >= oldPrin){
			if (month >= 1200){
				infinte = true;
				break;
			}
		}
        if (pmi > 0) {
            pmiPaid += pmi;
            adjustedPmiPaid += pmi * dollarValue;
            if (homeValue * .8 > prin) {
                pmi = 0;
                pmiMonth = month;
                if (logging) {
                    console.log("PMI PAID OFF");
                }
            }
        }
        if (logging) {
            console.log(`current prin: ${(prin).toFixed(2)}`);
            console.log("\n");

        }

        homeValue *= 1 + (valueIncrease * .01 / 12.0);
        dollarValue *= 1 - (inflation * .01 / 12.0);
		
    }
	
	if (infinte){
		console.log("");
		console.log("Loan never ends. Stats are after 100 years and you die.");
		console.log(`Remaining balance: $${(prin).toFixed(2)}`);
	}
	else{
        console.log("");
        console.log(`Took ${((month - month % 12) / 12).toFixed(0)} years and ${(month % 12).toFixed(0)} months to pay off loan`);
	}
    console.log(`Total interest paid: $${(totalInt).toFixed(2)}, avg: $${(totalInt / month).toFixed(2)}, adj: $${(adjustedTotalInt).toFixed(2)}, adj avg: $${(adjustedTotalInt / month).toFixed(2)}`);
    if (pmiStart > 0) {
        console.log(`Paid pmi off in ${((pmiMonth - pmiMonth % 12) / 12).toFixed(0)} years and ${(pmiMonth % 12).toFixed(0)} months`);
    }
	if (pmiPaid > 0){
        console.log(`Total pmi paid: $${(pmiPaid).toFixed(2)}, adj total: $${(adjustedPmiPaid / month).toFixed(2)}`);
	}
    console.log(`Average payment: $${(totPay / month).toFixed(2)}, adj: $${(adjustedTotPay / month).toFixed(2)}`);
	if (taxesPaid > 0){
        console.log(`Total taxes paid: $${(taxesPaid).toFixed(2)}, avg: $${(taxesPaid / month).toFixed(2)}, adj: $${(adjustedTaxesPaid).toFixed(2)}, adj avg: $${(adjustedTaxesPaid / month).toFixed(2)}`);
	}
    console.log(`Total paid less taxes: $${(totPay - taxesPaid).toFixed(0)}, adj: $${(adjustedTotPay - adjustedTaxesPaid).toFixed(0)}`);
    console.log(`Money pissed away each month on avg: $${((pmiPaid + taxesPaid + totalInt) / month).toFixed(2)}, avg adj: $${((adjustedPmiPaid + adjustedTaxesPaid + adjustedTotalInt) / month).toFixed(2)}`);
	if (valueIncrease != 0){
        console.log(`House value monthly change (avg adj): $${((homeValue * dollarValue - startingBal) / month).toFixed(0)}`);
        console.log(`House is worth: $${(homeValue).toFixed(2)} in current dollars and $${(homeValue * dollarValue).toFixed(2)} adjusted`);
	}
	if (inflation != 0){
        console.log(`Inflation has reduced the value of a dollar to $${(dollarValue).toFixed(2)} over the life of the loan`);
	}
}

function Main() {
    console.log("\n");
    var morgInfo = new Object();
    morgInfo.startingBal = GetValue("loanAmount");
    morgInfo.prin = GetValue("principal");
    morgInfo.rate = GetValue("interestRate");
    morgInfo.payment = GetValue("payment");
    morgInfo.minPayment = GetValue("minimumPayment");
    morgInfo.constPrinPayment = GetValue("constPrinPayment");
    morgInfo.maxRatio = GetValue("maxRatio");
    morgInfo.maxRatioWithPmi = GetValue("maxRatioWithPmi");
    morgInfo.pmi = GetValue("pmi");
    morgInfo.taxes = GetValue("taxes");
    morgInfo.valueIncrease = GetValue("valueIncrease");
    morgInfo.inflation = GetValue("inflation");
    var logging = GetCheckboxValue("logging");

    SaveMorgInfo(morgInfo);

    CalcMorg(morgInfo.startingBal, morgInfo.prin, morgInfo.rate, morgInfo.payment, morgInfo.minPayment, morgInfo.constPrinPayment, morgInfo.maxRatio, morgInfo.maxRatioWithPmi, morgInfo.pmi, morgInfo.taxes, morgInfo.valueIncrease, morgInfo.inflation, logging);

}

function GetValue(className) {
    var elements = document.getElementsByClassName(className);
    if (elements[0] == null || elements[0] == undefined) {
        return null;
    }
    return parseFloat(elements[0].value);
}

function SetValue(className, value) {
    var elements = document.getElementsByClassName(className)
    if (elements[0] == null || elements[0] == undefined) {
        return null;
    }
    elements[0].setAttribute("value", value);
}


function GetCheckboxValue(className){
	var elements = document.getElementsByClassName(className)
	if (elements[0] == null || elements[0] == undefined){
		return null;
	}
	return elements[0].checked;
}

function AdvOptionsToggle(){
	var hide = true
	if (GetCheckboxValue("advOptions"))
	{
		hide = false;
	}
	Array.from(document.getElementsByClassName("advancedInput")).forEach(function(i){
		
		if (hide)
		{
            i.classList.add("hide");
		}
		else{
            i.classList.remove("hide");
		}
	});
}

function InitialValues(){
    var c = getCookie("mortgageInfo");
    if (c == "") {
        return;
    }
    var cookie = JSON.parse(c);

    SetValue("loanAmount", cookie.startingBal);
    SetValue("principal", cookie.prin);
    SetValue("interestRate", cookie.rate);
    SetValue("payment", cookie.payment);
    SetValue("minimumPayment", cookie.minPayment);
    SetValue("constPrinPayment", cookie.constPrinPayment);
    SetValue("maxRatio", cookie.maxRatio);
    SetValue("maxRatioWithPmi", cookie.maxRatioWithPmi);
    SetValue("pmi", cookie.pmi);
    SetValue("valueIncrease", cookie.valueIncrease);
    SetValue("inflation", cookie.inflation);
}

function SaveMorgInfo(morgInfo) {
    var s = JSON.stringify(morgInfo);
    setCookie("mortgageInfo", s, 30)
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = ";expires=" + d;
    document.cookie = cname + "=" + cvalue + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
