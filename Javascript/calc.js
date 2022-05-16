function CalcMorg(morgInfo, isReCalc)
{
    var startingHomeValue = morgInfo.startingHomeValue;
    var startingPrincipal = morgInfo.prin;
    var prin = morgInfo.prin;
    var rate = morgInfo.rate;
    var payment = morgInfo.payment;
    var minPayment = morgInfo.minPayment;
    var constPrinPayment = morgInfo.constPrinPayment;
    var maxRatio = morgInfo.maxRatio;
    var maxRatioWithPmi = morgInfo.maxRatioWithPmi;
    var pmi = morgInfo.pmi;
    var taxes = morgInfo.taxes;
    var appreciation = morgInfo.appreciation;
    var inflation = morgInfo.inflation;
    var stopAfter = morgInfo.stopAfter;
    var logging = morgInfo.logging;
    var rentRate = morgInfo.rentRate;
    var paymentInflation = morgInfo.paymentInflation;
    var rentInflation = morgInfo.rentInflation;
    var rentPropValue = morgInfo.rentPropValue;
    var hideAdj = morgInfo.hideAdj;
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
    var homeValue = startingHomeValue;
    var infinte = false;
    var nowDate = (Date.now() / (1000 * 60 * 60 * 24 * 365.24) + 1970).toFixed(0);
    var thenDate = nowDate;
    var totalRentPaid = 0;
    var currentRentRate = rentRate;
    var rentPropValuePercentage = rentRate / startingHomeValue;
    var calculatedPayment = false;
    if (isReCalc)
    {
        calculatedPayment = true;
    }

    if (startingHomeValue == 0)
    {
        startingHomeValue = prin;
    }

    if (prin == 0)
    {
        prin = startingHomeValue;
        startingPrincipal = startingHomeValue;
    }

    if (payment == 0 && minPayment == 0)
    {
        // calc 30 yr morg
        var loanLengthMonths = 12 * 30;
        var perPaymentInterest = (rate / 100) / 12;
        var paymentNum = perPaymentInterest * Math.pow(1 + perPaymentInterest, loanLengthMonths);
        var paymentDem = Math.pow(1 + perPaymentInterest, loanLengthMonths) - 1;
        var paymentFraction = paymentNum / paymentDem;
        payment = startingPrincipal * paymentFraction;

        // calc monthly pmi
        var pmiValueLimit = .2 * homeValue
        var equity = homeValue - prin;
        var averagePrinicipalOverPmiPeriod = homeValue - pmiValueLimit;
        var monthlyInterest = (averagePrinicipalOverPmiPeriod * rate) / (100 * 12.0);

        // closeish starting value
        var monthlyPaymentWithPmi = payment + .25 * pmi;
        var pmiPaidTotal;
        var iterations = 3;

        // run a couple iterations to get a close value
        for (var i = 0; i < iterations; i++)
        {
            var sumToPay = pmiValueLimit - equity;
            var prinPaymentPerMonth = monthlyPaymentWithPmi - (monthlyInterest + pmi);
            var pmiMonths = sumToPay / prinPaymentPerMonth;
            pmiPaidTotal = pmiMonths * pmi;
            var pmiPerMonth = pmiPaidTotal / loanLengthMonths;

            monthlyPaymentWithPmi = payment + pmiPerMonth;
        }

        payment = (startingPrincipal + pmiPaidTotal) * paymentFraction;
        payment += taxes;
        calculatedPayment = true;
    }
    else if (payment < minPayment)
    {
        payment = minPayment;
    }

    var result = "";
    result += `Starting property value: ${startingHomeValue}\n`;
    result += `Starting loan amount: ${startingPrincipal}\n`;

    result += `Interest rate: ${(rate).toFixed(1)}%\n`;

    if (constPrinPayment > 0)
    {
        result += `cont prin payment of ${(constPrinPayment).toFixed(2)}\n`;
    }
    if (calculatedPayment)
    {
        result += `Calculating payment of ${(payment).toFixed(2)} for 30yr morg. (Includes taxes and pmi)\n`;
    }
    if ((maxRatio > 0) && (payment > minPayment))
    {
        result += `max ratio of principal to interest payment: ${(maxRatio * 100).toFixed(1)}%\n`;
    }

    if (inflation > 0 || appreciation > 0)
    {
        result += `Inflation at ${(inflation).toFixed(1)}%, and property appreciation at ${(appreciation).toFixed(1)}%\n`;
    }

    while (prin > 0)
    {
        month += 1;
        new_mInt = (prin * rate) / (100 * 12.0);
        var madePayment = payment;

        if (constPrinPayment > 0)
        {
            madePayment = constPrinPayment + new_mInt + taxes + pmi;
        }
        if (maxRatio != 0)
        {
            if ((maxRatioWithPmi > 0) && (pmi > 0))
            {
                if (madePayment * (1 - maxRatioWithPmi) > new_mInt)
                {
                    madePayment = new_mInt / (1 - maxRatioWithPmi);
                }
            }
            else if (madePayment * (1 - maxRatio) > new_mInt)
            {
                madePayment = new_mInt / (1 - maxRatio);
            }
        }

        if (madePayment < minPayment)
        {
            madePayment = minPayment;
        }

        if ((prin + mInt + taxes + pmi) < madePayment)
        {
            madePayment = prin + mInt + taxes + pmi;
        }

        if (paymentInflation)
        {
            madePayment = madePayment / dollarValue
        }

        diff = mInt - new_mInt;
        mInt = new_mInt;
        totalInt += mInt;
        adjustedTotalInt += mInt * dollarValue;
        adjustedPayment = madePayment * dollarValue;
        taxesPaid += taxes;
        adjustedTaxesPaid += taxes * dollarValue;

        if (logging)
        {
            console.log("Month: ", month);
            console.log(`payment of: ${(madePayment).toFixed(2)}, adj: ${(adjustedPayment).toFixed(2)}`);
            console.log(`interest: ${(mInt).toFixed(2)}, adj: ${(mInt * dollarValue).toFixed(2)}`);

            if (diff > 0)
            {
                console.log(`interest decreased by: ${(diff).toFixed(2)}`);
            }
        }

        var oldPrin = prin;
        totPay += madePayment;
        adjustedTotPay += adjustedPayment;
        prin -= madePayment;
        prin += mInt;
        prin += taxes;
        prin += pmi;

        // pay rent
        if (rentRate != 0)
        {
            if (rentInflation)
            {
                currentRentRate = rentRate / dollarValue;
            }
            else if (rentPropValue)
            {
                currentRentRate = rentPropValuePercentage * homeValue;
            }

            if (logging)
            {
                console.log(`Rent paid: ${(currentRentRate).toFixed(2)}`);
            }

            totalRentPaid += currentRentRate;
        }

        // calc year
        if (month % 12 == 0)
        {
            thenDate++;
        }

        if (prin >= oldPrin)
        {
            if (month >= 1200)
            {
                infinte = true;
                break;
            }
        }

        // pmi complete check
        if (pmi > 0)
        {
            if (homeValue * .8 > prin)
            {
                pmi = 0;
                pmiMonth = month;
                if (logging)
                {
                    console.log("PMI PAID OFF");
                }
            }

            pmiPaid += pmi;
            adjustedPmiPaid += pmi * dollarValue;
        }
        if (logging)
        {
            console.log(`current prin: ${(prin).toFixed(2)}`);
            console.log("\n");

        }

        homeValue *= 1 + (appreciation * .01 / 12.0);
        dollarValue *= 1 - (inflation * .01 / 12.0);

        if (stopAfter >= month)
        {
            break;
        }
    }

    if (calculatedPayment && stopAfter == 0 && month != 360)
    {
        var monthsoff = 360 - month;
        morgInfo.payment = payment - monthsoff*2;

        if (logging)
        {
            console.log(`Payment calculated invalid for w/e reason retrying. Old payment value: ${payment}, new payment value: ${morgInfo.payment}`);
            console.log("\n");
        }

        CalcMorg(morgInfo, true);
        return;
    }


    var paidOff = true;
    if (prin > 0)
    {
        paidOff = false;
    }

    if (infinte)
    {
        result += "Loan never ends. Stats are after 100 years and you die.\n";
        result += `Remaining balance: $${(prin).toFixed(2)}`;
        if ((inflation != 0) && !hideAdj)
        {
            result += `, adj total: $${(prin * dollarValue).toFixed(2)}\n`;
        }
        else
        {
            result += `\n`;
        }
    }
    else if (paidOff)
    {
        result += `Took ${((month - month % 12) / 12).toFixed(0)} years and ${(month % 12).toFixed(0)} months to pay off loan\n`;
    }
    else
    {
        result += `Spent ${((month - month % 12) / 12).toFixed(0)} years and ${(month % 12).toFixed(0)} months paying off loan. Remaining balance: $${prin.toFixed(2)}\n`;
    }

    result += `Total interest paid: $${(totalInt).toFixed(2)}, avg: $${(totalInt / month).toFixed(2)}`;

    if ((inflation != 0) && !hideAdj)
    {
        result += `, adj: $${(adjustedTotalInt).toFixed(2)}, adj avg: $${(adjustedTotalInt / month).toFixed(2)}\n`;
    }
    else
    {
        result += `\n`;
    }

    if (pmiStart > 0)
    {
        result += `Paid pmi off in ${((pmiMonth - pmiMonth % 12) / 12).toFixed(0)} years and ${(pmiMonth % 12).toFixed(0)} months\n`;
    }
    if (pmiPaid > 0)
    {
        result += `Total pmi paid: $${(pmiPaid).toFixed(2)}`;
        if ((inflation != 0) && !hideAdj)
        {
            result += `, adj total: $${(adjustedPmiPaid / month).toFixed(2)}\n`;
        }
        else
        {
            result += `\n`;
        }
    }

    result += `Average payment: $${(totPay / month).toFixed(2)}`;
    if ((inflation != 0) && !hideAdj)
    {
        result += `, adj: $${(adjustedTotPay / month).toFixed(2)}\n`;
    }
    else
    {
        result += `\n`;
    }

    if (taxesPaid > 0)
    {
        result += `Total taxes paid: $${(taxesPaid).toFixed(2)}, avg: $${(taxesPaid / month).toFixed(2)}`
        if ((inflation != 0) && !hideAdj)
        {
            result += `, adj: $${(adjustedTaxesPaid).toFixed(2)}, adj avg: $${(adjustedTaxesPaid / month).toFixed(2)}\n`;
        }
        else
        {
            result += `\n`;
        }

        result += `Total paid less taxes: $${(totPay - taxesPaid).toFixed(0)}`;
        if ((inflation != 0) && !hideAdj)
        {
            result += `, adj: $${(adjustedTotPay - adjustedTaxesPaid).toFixed(2)}\n`;
        }
        else
        {
            result += `\n`;
        }
    }

    if (pmiPaid + taxesPaid > 0)
    {
        result += `Money pissed away each month on avg: $${((pmiPaid + taxesPaid + totalInt) / month).toFixed(2)}`;
        if ((inflation != 0) && !hideAdj)
        {
            result += `, avg adj: $${((adjustedPmiPaid + adjustedTaxesPaid + adjustedTotalInt) / month).toFixed(2)}\n`;
        }
        else
        {
            result += `\n`;
        }
    }

    result += `Total actually paid: $${(totPay).toFixed(0)}`
    if ((inflation != 0) && !hideAdj)
    {
        result += `, adj: $${(adjustedTotPay).toFixed(2)}\n`;
    }
    else
    {
        result += `\n`;
    }

    if (totalRentPaid != 0)
    {
        result += `Total rent earned: $${totalRentPaid.toFixed(2)}, avg: $${(totalRentPaid / month).toFixed(2)}`;
        if ((inflation != 0) && !hideAdj)
        {
            result += `, adj: $${(totalRentPaid * dollarValue).toFixed(2)}, avg: $${(totalRentPaid * dollarValue / month).toFixed(2)}\n`;
        }
        else
        {
            result += `\n`;
        }

        var monthlyCashFlow = (totalRentPaid - totPay) / month;
        result += `Average monthly cashflow: $${monthlyCashFlow.toFixed(2)}, Last month cashflow: $${(currentRentRate - payment).toFixed(2)}`;
        if ((inflation != 0) && !hideAdj)
        {
            result += `, adj: $${(monthlyCashFlow * dollarValue).toFixed(2)}, Last month cashflow: $${((currentRentRate - payment) * dollarValue).toFixed(2)}\n`;
        }
        else
        {
            result += `\n`;
        }
    }

    //Equity and value increase (applicable even if not setting appreciation rates)
    var intialInvestment = startingHomeValue - startingPrincipal;
    result += `Property equity monthly change: $${((homeValue - prin - intialInvestment) / month).toFixed(2)}`

    if ((inflation != 0) && !hideAdj)
    {
        result += `, adj: $${((homeValue * dollarValue - prin) / month).toFixed(2)}\n`;
    }
    else
    {
        result += `\n`;
    }
    result += `Property is worth: $${(homeValue).toFixed(2)}`
    if ((inflation != 0) && !hideAdj)
    {
        result += `, adj: $${(homeValue * dollarValue).toFixed(2)}\n`;
    }
    else
    {
        result += `\n`;
    }

    result += `Initial investment of $${intialInvestment.toFixed(2)} has grown to be worth $${(homeValue - prin).toFixed(2)}`;

    if ((inflation != 0) && !hideAdj)
    {
        result += `, adj: $${(homeValue - prin * dollarValue).toFixed(2)}\n`;
    }
    else
    {
        result += `\n`;
    }

    var totalGross = (homeValue - prin) - (intialInvestment + totPay) + totalRentPaid;
    result += `Total gross profit $${totalGross.toFixed(2)}`;

    if ((inflation != 0) && !hideAdj)
    {
        result += `, adj: $${(totalGross * dollarValue).toFixed(2)}\n`;
    }
    else
    {
        result += `\n`;
    }

    if ((inflation != 0) && !hideAdj)
    {
        result += `$100.00 in ${thenDate} dollars is worth $${(100 * dollarValue).toFixed(2)} adjusted (${nowDate} dollars) due to inflation.`;
    }

    console.log(result);
    document.getElementsByClassName("mortgageStats")[0].textContent = result;
}

function ReCalc()
{
    console.log("\n");
    var morgInfo = new Object();
    morgInfo.startingHomeValue = GetValue("loanAmount");
    morgInfo.prin = GetValue("principal");
    morgInfo.rate = GetValue("interestRate");
    morgInfo.payment = GetValue("payment");
    morgInfo.minPayment = GetValue("minimumPayment");
    morgInfo.constPrinPayment = GetValue("constPrinPayment");
    morgInfo.maxRatio = GetValue("maxRatio");
    morgInfo.maxRatioWithPmi = GetValue("maxRatioWithPmi");
    morgInfo.pmi = GetValue("pmi");
    morgInfo.taxes = GetValue("taxes");
    morgInfo.appreciation = GetValue("appreciation");
    morgInfo.inflation = GetValue("inflation");
    morgInfo.stopAfter = GetValue("stopAfter");
    morgInfo.rentRate = GetValue("RentRate");
    morgInfo.paymentInflation = GetCheckboxValue("paymentInflation");
    morgInfo.rentInflation = GetCheckboxValue("rentInflation");
    morgInfo.rentPropValue = GetCheckboxValue("rentPropValue");
    morgInfo.hideAdj = GetCheckboxValue("hideAdj");
    morgInfo.logging = GetCheckboxValue("logging");

    SaveMorgInfo(morgInfo);

    document.getElementsByClassName("mortgageStats")[0].textContent = "";
    CalcMorg(morgInfo, false); //.startingHomeValue, morgInfo.prin, morgInfo.rate, morgInfo.payment, morgInfo.minPayment, morgInfo.constPrinPayment, morgInfo.maxRatio, morgInfo.maxRatioWithPmi, morgInfo.pmi, morgInfo.taxes, morgInfo.appreciation, morgInfo.inflation, logging);

}

function GetValue(className)
{
    var elements = document.getElementsByClassName(className);
    if (elements[0] == null || elements[0] == undefined)
    {
        return null;
    }
    return parseFloat(elements[0].value);
}

function GetValueString(className)
{
    var elements = document.getElementsByClassName(className);
    if (elements[0] == null || elements[0] == undefined)
    {
        return null;
    }
    var value = elements[0].value;
    return value.replace(",", "");
}

function SetValue(className, value)
{
    var elements = document.getElementsByClassName(className)
    if (elements[0] == null || elements[0] == undefined)
    {
        return null;
    }
    if (value == null || value == undefined)
    {
        value = 0;
    }

    elements[0].setAttribute("value", value);
    elements[0].value = value;
}


function GetCheckboxValue(className)
{
    var elements = document.getElementsByClassName(className)
    if (elements[0] == null || elements[0] == undefined)
    {
        return null;
    }
    return elements[0].checked;
}

function AdvOptionsToggle()
{
    var hide = true
    if (GetCheckboxValue("advOptions"))
    {
        hide = false;
    }
    Array.from(document.getElementsByClassName("advancedInput")).forEach(function (i)
    {

        if (hide)
        {
            i.classList.add("hide");
        }
        else
        {
            i.classList.remove("hide");
        }
    });
}

function InitialValues()
{
    var urlParams = new URLSearchParams(window.location.search);
    var cookie = new Object();
    var runImmediately = false;

    if (urlParams.has('loanAmount'))
    {
        cookie.startingHomeValue = urlParams.get('loanAmount');

        cookie.prin = urlParams.get('principal');
        cookie.rate = urlParams.get('interestRate');
        cookie.payment = urlParams.get('payment');
        cookie.minPayment = urlParams.get('minimumPayment');
        cookie.constPrinPayment = urlParams.get('constPrinPayment');
        cookie.maxRatioWithPmi = urlParams.get('maxRatioWithPmi');
        cookie.pmi = urlParams.get('pmi');
        cookie.taxes = urlParams.get('taxes');
        cookie.appreciation = urlParams.get('appreciation');
        cookie.stopAfter = urlParams.get('stopAfter');
        cookie.rentRate = urlParams.get('rentRate');
        cookie.rentRate = urlParams.get('rentRate');
        cookie.paymentInflation = urlParams.get('paymentInflation');
        cookie.rentInflation = urlParams.get('rentInflation');
        cookie.rentPropValue = urlParams.get('rentPropValue');
        cookie.inflation = urlParams.get('inflation');
        runImmediately = true;
    }
    else
    {
        var c = getCookie("mortgageInfo");
        if (c == "")
        {
            return;
        }
        var cookie = JSON.parse(c);
    }

    SetValue("loanAmount", cookie.startingHomeValue);
    SetValue("principal", cookie.prin);
    SetValue("interestRate", cookie.rate);
    SetValue("payment", cookie.payment);
    SetValue("minimumPayment", cookie.minPayment);
    SetValue("constPrinPayment", cookie.constPrinPayment);
    SetValue("maxRatio", cookie.maxRatio);
    SetValue("maxRatioWithPmi", cookie.maxRatioWithPmi);
    SetValue("pmi", cookie.pmi);
    SetValue("taxes", cookie.taxes);
    SetValue("appreciation", cookie.appreciation);
    SetValue("stopAfter", cookie.stopAfter);
    SetValue("rentRate", cookie.rentRate);
    SetValue("paymentInflation", cookie.paymentInflation);
    SetValue("rentInflation", cookie.rentInflation);
    SetValue("rentPropValue", cookie.rentPropValue);
    SetValue("inflation", cookie.inflation);

    if (runImmediately)
    {
        ReCalc();
    }
}

function SaveMorgInfo(morgInfo)
{
    var s = JSON.stringify(morgInfo);
    setCookie("mortgageInfo", s, 30)
}

function setCookie(cname, cvalue, exdays)
{
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = ";expires=" + d;
    document.cookie = cname + "=" + cvalue + expires + ";path=/";
}

function getCookie(cname)
{
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++)
    {
        var c = ca[i];
        while (c.charAt(0) == ' ')
        {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0)
        {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function CopySearch()
{
    var searchUrl = window.location.href.split('?')[0] + "?";
    searchUrl += getSearchValueParameterString("loanAmount");
    searchUrl += getSearchValueParameterString("principal");
    searchUrl += getSearchValueParameterString("interestRate");
    searchUrl += getSearchValueParameterString("payment");
    searchUrl += getSearchValueParameterString("minimumPayment");
    searchUrl += getSearchValueParameterString("constPrinPayment");
    searchUrl += getSearchValueParameterString("maxRatio");
    searchUrl += getSearchValueParameterString("maxRatioWithPmi");
    searchUrl += getSearchValueParameterString("pmi");
    searchUrl += getSearchValueParameterString("taxes");
    searchUrl += getSearchValueParameterString("appreciation");
    searchUrl += getSearchValueParameterString("inflation");
    searchUrl += getSearchValueParameterString("stopAfter");
    searchUrl += getSearchValueParameterString("rentRate");
    searchUrl += getSearchValueParameterString("rentInflation");
    searchUrl += getSearchValueParameterString("rentPropValue");
    searchUrl = searchUrl.replace(/&+$/g, '');
    copyToClipboard(searchUrl)
}

const copyToClipboard = str =>
{
    const el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
};

function getSearchValueParameterString(cname)
{
    var v = GetValue(cname)
    if (v != NaN && v != 0 && v != null)
    {
        var s = cname + "=" + v + "&"
        return s;
    }
    return ""
}
