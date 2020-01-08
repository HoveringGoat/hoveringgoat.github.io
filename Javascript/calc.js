function CalcMorg(startingBal, prin, rate, payment, minPayment, constPrinPayment, maxRatio, maxRatioWithPmi, pmi, taxes, valueIncrease, inflation, logging) {
	
    var pmiStart = pmi
    var pmiMonth = 0
    var pmiPaid = 0
    var adjustedPmiPaid = 0
    var taxesPaid = 0
    var adjustedTaxesPaid = 0
    var mInt = 0
    var month = 0
    var totalInt = 0
    var totPay = 0
    var adjustedPayment = 0
    var adjustedTotalInt = 0
    var adjustedTotPay = 0
    var dollarValue = 1
    var homeValue = startingBal
	var infinte = false;
	
	if (startingBal == 0){
		startingBal = prin;
	}
	if (prin == 0){
		prin = startingBal;
	}
    if (payment < minPayment) {
        payment = minPayment
    }

    console.log("Starting home value: ", homeValue)
    console.log("Starting loan value: ", prin)
    if (constPrinPayment > 0) {
        console.log(`cont prin payment of ${(constPrinPayment).toFixed(2)}`)
    }
    else {
        console.log(`payment of ${(payment).toFixed(2)}`)
    }
    if ((maxRatio > 0) && (payment > minPayment)) {
        console.log(`max ratio of principal to interest payment: ${(maxRatio * 100).toFixed(2)}`)
    }

	if (inflation >0 || valueIncrease >0){
		console.log(`Inflation at ${(inflation).toFixed(2)}%, and house value increase at ${(valueIncrease).toFixed(2)}%`)
	}
    while (prin > 0) {
        month += 1
        new_mInt = (prin * rate) / (100 * 12.0)

        if (constPrinPayment > 0) {
            payment = constPrinPayment + new_mInt + taxes + pmi
        }
        if (maxRatio != 0) {
            if ((maxRatioWithPmi > 0) && (pmi > 0)) {
                if (payment * (1 - maxRatioWithPmi) > new_mInt) {
                    payment = new_mInt / (1 - maxRatioWithPmi)
                }
                else if (payment * (1 - maxRatio) > new_mInt) {
                    payment = new_mInt / (1 - maxRatio)
                }
            }
        }

        if (payment < minPayment) {
            payment = minPayment
        }
		
		if ((prin+mInt+taxes+pmi)< payment){
			payment = prin+mInt+taxes+pmi
		}


        diff = mInt - new_mInt
        mInt = new_mInt
        totalInt += mInt
        adjustedTotalInt += mInt * dollarValue
        adjustedPayment = payment * dollarValue
        taxesPaid += taxes
        adjustedTaxesPaid += taxes * dollarValue

        if (logging) {
            console.log("Month: ", month)
            console.log(`payment of: ${(payment).toFixed(2)}, adj: ${(adjustedPayment).toFixed(2)}`)
            console.log(`interest: ${(mInt).toFixed(2)}, adj: ${(mInt * dollarValue).toFixed(2)}`)

            if (diff > 0) {
                console.log(`interest decreased by: ${(diff).toFixed(2)}`)
            }
        }
		var oldPrin = prin;
		totPay += payment
		adjustedTotPay += adjustedPayment
		prin -= payment
		prin += mInt
		prin += taxes
		prin += pmi
		
		if (prin >= oldPrin){
			if (month >= 1200){
				infinte = true;
				break;
			}
		}
        if (pmi > 0) {
            pmiPaid += pmi
            adjustedPmiPaid += pmi * dollarValue
            if (homeValue * .8 > prin) {
                pmi = 0
            }
            pmiMonth = month
            if (logging) {
                console.log("****************************")
                console.log("PMI PAID OFF")
            }
        }
        if (logging) {
            console.log(`current prin: ${(prin).toFixed(2)}`)
            console.log("\n")

        }

        homeValue *= 1 + (valueIncrease * .01 / 12.0)
        dollarValue *= 1 - (inflation * .01 / 12.0)
		
    }
	
	if (infinte){
		console.log("");
		console.log("Loan never ends. Stats are after 100 years and you die.");
		console.log(`Remaining balance: ${(prin).toFixed(2)}`);
	}
	else{
		console.log("")
		console.log(`Took ${(month - month % 12) / 12} years and ${month % 12} months to pay off loan`)
	}
    console.log(`Total interest paid: ${(totalInt).toFixed(2)}, avg: ${(totalInt / month).toFixed(2)}, adj: ${(adjustedTotalInt).toFixed(2)}, adj avg: ${(adjustedTotalInt / month).toFixed(2)}`)
    if (pmiStart > 0) {
        console.log(`Paid pmi off in ${(pmiMonth - pmiMonth % 12) / 12} years and ${pmiMonth % 12} months`)
    }
	if (pmiPaid > 0){
		console.log(`Total pmi paid: ${(pmiPaid).toFixed(2)}, adj total: ${(adjustedPmiPaid / month).toFixed(2)}`)
	}
    console.log(`Average payment: ${(totPay / month).toFixed(2)}, adj: ${(adjustedTotPay / month).toFixed(2)}`)
	if (taxesPaid > 0){
		console.log(`Total taxes paid: ${(taxesPaid).toFixed(2)}, avg: ${(taxesPaid / month).toFixed(2)}, adj: ${(adjustedTaxesPaid).toFixed(2)}, adj avg: ${(adjustedTaxesPaid / month).toFixed(2)}`)
	}
    console.log(`Total paid less taxes: ${totPay - taxesPaid}, adj: ${adjustedTotPay - adjustedTaxesPaid}`)
    console.log(`Money pissed away each month on avg: ${((pmiPaid + taxesPaid + totalInt) / month).toFixed(2)}, avg adj: ${((adjustedPmiPaid + adjustedTaxesPaid + adjustedTotalInt) / month).toFixed(2)}`)
	if (valueIncrease != 0){
		console.log(`House value monthly change (avg adj): ${(homeValue * dollarValue - startingBal) / month}`)
		console.log(`House is worth: ${(homeValue).toFixed(2)} in current dollars and ${(homeValue * dollarValue).toFixed(2)} adjusted`)
	}
	if (inflation != 0){
		console.log(`Inflation has reduced the value of a dollar to ${(dollarValue).toFixed(2)} (${(dollarValue* 100).toFixed(1)})% over the life of the loan`)
	}
}

function Main() {
	console.log("\n");
    var startingBal = GetValue("loanAmount");
    var prin = GetValue("principal");
    var rate = GetValue("interestRate");
    var payment = GetValue("payment");
    var minPayment = GetValue("minimumPayment");
    var constPrinPayment = GetValue("constPrinPayment");
    var maxRatio = GetValue("maxRatio");
    var maxRatioWithPmi = GetValue("maxRatioWithPmi");
    var pmi = GetValue("pmi");
    var taxes = GetValue("taxes");
    var valueIncrease = GetValue("valueIncrease");
    var inflation = GetValue("inflation");
    var logging = GetCheckboxValue("logging");

    CalcMorg(startingBal, prin, rate, payment, minPayment, constPrinPayment, maxRatio, maxRatioWithPmi, pmi, taxes, valueIncrease, inflation, logging);

}

function GetValue(className){
	var elements = document.getElementsByClassName(className)
	if (elements[0] == null || elements[0] == undefined){
		return null;
	}
	return parseFloat(elements[0].value);
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
			i.classList.add("hide")
		}
		else{
			i.classList.remove("hide")
		}
	});
}
