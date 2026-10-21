const form = document.getElementById("churnForm");

const button = document.getElementById("predictButton");

const buttonText = document.getElementById("buttonText");

const loader = document.getElementById("loader");

const resultCard = document.getElementById("resultCard");

const probabilityText =
    document.getElementById("probabilityText");

const progressBar =
    document.getElementById("progressBar");

const resultTitle =
    document.getElementById("resultTitle");

const resultDescription =
    document.getElementById("resultDescription");

const predictionText =
    document.getElementById("predictionText");

const riskText =
    document.getElementById("riskText");

const resultIcon =
    document.getElementById("resultIcon");


form.addEventListener("submit", async function (event) {

    event.preventDefault();


    /* -----------------------------
       GET FORM VALUES
    ----------------------------- */

    const formData = {

        gender:
            document.getElementById("gender").value,

        SeniorCitizen:
            document.getElementById("SeniorCitizen").value,

        Partner:
            document.getElementById("Partner").value,

        Dependents:
            document.getElementById("Dependents").value,

        tenure:
            document.getElementById("tenure").value,

        PhoneService:
            document.getElementById("PhoneService").value,

        MultipleLines:
            document.getElementById("MultipleLines").value,

        InternetService:
            document.getElementById("InternetService").value,

        OnlineSecurity:
            document.getElementById("OnlineSecurity").value,

        OnlineBackup:
            document.getElementById("OnlineBackup").value,

        DeviceProtection:
            document.getElementById("DeviceProtection").value,

        TechSupport:
            document.getElementById("TechSupport").value,

        StreamingTV:
            document.getElementById("StreamingTV").value,

        StreamingMovies:
            document.getElementById("StreamingMovies").value,

        Contract:
            document.getElementById("Contract").value,

        PaperlessBilling:
            document.getElementById("PaperlessBilling").value,

        PaymentMethod:
            document.getElementById("PaymentMethod").value,

        MonthlyCharges:
            document.getElementById("MonthlyCharges").value,

        TotalCharges:
            document.getElementById("TotalCharges").value
    };


    /* -----------------------------
       LOADING
    ----------------------------- */

    button.disabled = true;

    buttonText.style.display = "none";

    loader.style.display = "block";

    resultCard.style.display = "none";


    try {

        const response = await fetch("/predict", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(formData)

        });


        const result = await response.json();


        if (!response.ok || !result.success) {

            throw new Error(
                result.error || "Prediction failed"
            );
        }


        showResult(result);


    } catch (error) {

        console.error(error);

        alert(
            "Prediction Error:\n\n" +
            error.message
        );

    } finally {

        button.disabled = false;

        buttonText.style.display = "block";

        loader.style.display = "none";
    }

});


function showResult(result) {

    const probability = result.probability;

    resultCard.style.display = "block";


    /* probability */

    probabilityText.innerText =
        probability + "%";


    setTimeout(() => {

        progressBar.style.width =
            probability + "%";

    }, 100);


    /* churn */

    if (result.prediction === 1) {

        resultTitle.innerText =
            "Customer Likely to Churn";

        resultDescription.innerText =
            "This customer has a significant risk of leaving. Consider retention strategies.";

        predictionText.innerText =
            "Churn";

        resultIcon.innerText =
            "!";

        resultIcon.style.background =
            "rgba(239, 68, 68, 0.12)";

        resultIcon.style.color =
            "#f87171";

    } else {

        resultTitle.innerText =
            "Customer Likely to Stay";

        resultDescription.innerText =
            "This customer currently shows a lower probability of churn.";

        predictionText.innerText =
            "No Churn";

        resultIcon.innerText =
            "✓";

        resultIcon.style.background =
            "rgba(34, 197, 94, 0.12)";

        resultIcon.style.color =
            "#4ade80";
    }


    riskText.innerText =
        result.risk;


    /* automatically move to result */

    resultCard.scrollIntoView({

        behavior: "smooth",

        block: "center"
    });

}