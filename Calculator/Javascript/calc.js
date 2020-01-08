function CalcMorg(startingBal, prin, rate, payment, minPayment, constPrinPayment, maxRatio, maxRatioWithPmi, pmi, taxes, valueIncrease, inflation, logging) {
	    if (prin == "NaN"){
    	return
    }
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

    if (payment < minPayment) {
        payment = minPayment
    }

    console.log("Starting home value: ", homeValue)
    console.log("Starting loan value: ", prin)
    if (constPrinPayment > 0) {
        console.log(`cont prin payment of ${constPrinPayment}`)
    }
    else {
        console.log(`payment of ${payment}`)
    }
    if ((maxRatio > 0) && (payment > minPayment)) {
        console.log(`max ratio of principal to interest payment: ${maxRatio * 100}`)
    }

    console.log(`Inflation at ${inflation}%, and house value increase at ${valueIncrease}%`)
    while (prin > payment) {
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


        diff = mInt - new_mInt
        mInt = new_mInt
        totalInt += mInt
        adjustedTotalInt += mInt * dollarValue
        adjustedPayment = payment * dollarValue
        taxesPaid += taxes
        adjustedTaxesPaid += taxes * dollarValue

        if (logging) {
            console.log("Month: ", month)
            console.log(`payment of: ${payment}, adj: ${adjustedPayment}`)
            console.log(`interest: ${mInt}, adj: ${mInt * dollarValue}`)

            if (diff > 0) {
                console.log(`interest decreased by: ${diff}`)
            }
        }
        totPay += payment
        adjustedTotPay += adjustedPayment
        prin -= payment
        prin += mInt
        prin += taxes
        prin += pmi
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
            console.log(`current prin: ${prin}`)
            console.log("\n")

        }

        homeValue *= 1 + (valueIncrease * .01 / 12.0)
        dollarValue *= 1 - (inflation * .01 / 12.0)
        month += 1
    }
    console.log("")
    console.log(`Took ${(month - month % 12) / 12} years and ${month % 12} months to pay off loan`)
    console.log(`Total interest paid: ${totalInt}, avg: ${totalInt / month}, adj: ${adjustedTotalInt}, adj avg: ${adjustedTotalInt / month}`)
    if (pmiStart > 0) {
        console.log(`Paid pmi off in ${(pmiMonth - pmiMonth % 12) / 12} years and ${pmiMonth % 12} months`)
    }
    console.log(`Total pmi paid: ${pmiPaid}, adj total: ${adjustedPmiPaid / month}`)
    console.log(`Average payment: ${totPay / month}, adj: ${adjustedTotPay / month}`)
    console.log(`Total taxes paid: ${taxesPaid}, avg: ${taxesPaid / month}, adj: ${adjustedTaxesPaid}, adj avg: ${adjustedTaxesPaid / month}`)
    console.log(`Total paid less taxes: ${totPay - taxesPaid}, adj: ${adjustedTotPay - adjustedTaxesPaid}`)
    console.log(`Money pissed away each month on avg: ${(pmiPaid + taxesPaid + totalInt) / month}, avg adj: ${(adjustedPmiPaid + adjustedTaxesPaid + adjustedTotalInt) / month}`)
    console.log(`House value monthly change (avg adj): ${(homeValue * dollarValue - startingBal) / month}`)
    console.log(`House is worth: ${homeValue} in current dollars and ${homeValue * dollarValue} adjusted`)
    console.log(`Inflation has reduced the value of a dollar by ${dollarValue * 100}% over the life of the loan`)
}

function Main() {
	console.log("\n")
    var startingBal = GetValue("loanAmount")
    var prin = GetValue("principal")
    var rate = GetValue("interestRate")
    var payment = GetValue("payment")
    var minPayment = GetValue("minimumPayment")
    var constPrinPayment = GetValue("constPrinPayment")
    var maxRatio = GetValue("maxRatio")
    var maxRatioWithPmi = GetValue("maxRatioWithPmi")
    var pmi = GetValue("pmi")
    var taxes = GetValue("taxes")
    var valueIncrease = GetValue("valueIncrease")
    var inflation = GetValue("inflation")
    var logging = GetCheckboxValue("logging")

    CalcMorg(startingBal, prin, rate, payment, minPayment, constPrinPayment, maxRatio, maxRatioWithPmi, pmi, taxes, valueIncrease, inflation, logging)

}

function GetValue(className){
	var elements = document.getElementsByClassName(className)
	if (elements[0] == null || elements[0] == undefined){
		return null
	}
	return parseFloat(elements[0].value)
}


function GetCheckboxValue(className){
	var elements = document.getElementsByClassName(className)
	if (elements[0] == null || elements[0] == undefined){
		return null
	}
	return elements[0].checked
}
