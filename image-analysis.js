// =========================
// วิเคราะห์ภาพ
// =========================

function analyzeImage(canvas, testType) {

    const ctx = canvas.getContext("2d");

    const width = canvas.width;
    const height = canvas.height;

    // บริเวณตัวอย่างตรงกลางภาพ
    const roiSize =
        Math.floor(Math.min(width, height) * 0.3);

    const startX =
        Math.floor((width - roiSize) / 2);

    const startY =
        Math.floor((height - roiSize) / 2);

    // =========================
// อ่านสีเฉพาะส่วนกลางของ ROI
// ตัดขอบออก 15%
// =========================

const margin =
    Math.floor(roiSize * 0.15);

const innerSize =
    roiSize - (margin * 2);

const imageData =
    ctx.getImageData(
        startX + margin,
        startY + margin,
        innerSize,
        innerSize
    );
    let totalR = 0;
    let totalG = 0;
    let totalB = 0;
    let count = 0;


    // =========================
    // อ่านค่า RGB
    // =========================

    for (
        let i = 0;
        i < imageData.data.length;
        i += 4
    ) {

        totalR += imageData.data[i];
        totalG += imageData.data[i + 1];
        totalB += imageData.data[i + 2];

        count++;
    }


    const r =
        Math.round(totalR / count);

    const g =
        Math.round(totalG / count);

    const b =
        Math.round(totalB / count);
        // =========================
// ตรวจสอบคุณภาพแสงเบื้องต้น
// =========================

const brightness =
    (r + g + b) / 3;

if (brightness < 35) {

    alert(
        "ภาพมืดเกินไป\n\n" +
        "กรุณาถ่ายใหม่ในบริเวณที่มีแสงเพียงพอ"
    );

    return;
}

if (brightness > 245) {

    alert(
        "ภาพสว่างเกินไป\n\n" +
        "กรุณาหลีกเลี่ยงแสงจ้าหรือแสงสะท้อน"
    );

    return;
}


    // =========================
    // แสดง RGB
    // =========================

    document.getElementById("rgbValue").textContent =
        r + ", " + g + ", " + b;

    document.getElementById("colorPreview").style.background =
        "rgb(" + r + "," + g + "," + b + ")";


    // =========================
    // HSV
    // =========================

    const hsv =
        rgbToHsv(r, g, b);

    document.getElementById("hsvValue").textContent =
        hsv.h.toFixed(1) +
        ", " +
        hsv.s.toFixed(1) +
        ", " +
        hsv.v.toFixed(1);


    // =========================
    // CIELAB
    // =========================

    const lab =
        rgbToLab(r, g, b);

    document.getElementById("labValue").textContent =
        lab.L.toFixed(1) +
        ", " +
        lab.a.toFixed(1) +
        ", " +
        lab.b.toFixed(1);


    // แสดงผลการวิเคราะห์
    document
        .getElementById("analysisResult")
        .classList
        .remove("hidden");


    console.log("Test:", testType);
    console.log("RGB:", r, g, b);
    console.log("HSV:", hsv);
    console.log("LAB:", lab);


    // =========================
    // เปรียบเทียบ Calibration
    // =========================

    const result =
        findClosestCalibration(
            lab,
            testType
        );

        


    if (result) {

    console.log(
        "ผลการเปรียบเทียบสี:",
        result
    );

        const resultBox =
            document.getElementById(
                "analysisResult"
            );


        let autoResult =
            document.getElementById(
                "autoAnalysisResult"
            );


        if (!autoResult) {

            autoResult =
                document.createElement("div");

            autoResult.id =
                "autoAnalysisResult";

            resultBox.appendChild(
                autoResult
            );
        }


        autoResult.innerHTML =
            '<div class="auto-result">' +

                '<h3>🎯 ผลการตรวจ</h3>' +

                '<p>การทดสอบ: <strong>' +

                    (
                        testType === "biuret"
                            ? "โปรตีน — Biuret"
                            : "น้ำตาลรีดิวซ์ — Benedict"
                    ) +

                '</strong></p>' +

                '<p>ระดับที่ใกล้เคียงที่สุด</p>' +

                '<div class="result-level">' +

                    result.level +

                '</div>' +

                '<p>หน่วย: g/10 mL</p>' +

                '<p class="result-distance">' +

                    'ค่าความแตกต่างของสี: ' +

                    result.distance.toFixed(2) +

                '</p>' +

            '</div>';

    } else {

        alert(
            "ยังไม่มีข้อมูล Calibration ของ " +
            testType
        );
    }
}


// =========================
// RGB → HSV
// =========================

function rgbToHsv(r, g, b) {

    r /= 255;
    g /= 255;
    b /= 255;

    const max =
        Math.max(r, g, b);

    const min =
        Math.min(r, g, b);

    const d =
        max - min;

    let h = 0;


    if (d !== 0) {

        if (max === r) {

            h =
                60 *
                (((g - b) / d) % 6);

        } else if (max === g) {

            h =
                60 *
                ((b - r) / d + 2);

        } else {

            h =
                60 *
                ((r - g) / d + 4);
        }
    }


    if (h < 0) {
        h += 360;
    }


    const s =
        max === 0
            ? 0
            : d / max;

    const v =
        max;


    return {

        h: h,

        s: s * 100,

        v: v * 100
    };
}


// =========================
// RGB → CIELAB
// =========================

function rgbToLab(r, g, b) {

    r /= 255;
    g /= 255;
    b /= 255;


    r =
        r > 0.04045
            ? Math.pow(
                (r + 0.055) / 1.055,
                2.4
            )
            : r / 12.92;


    g =
        g > 0.04045
            ? Math.pow(
                (g + 0.055) / 1.055,
                2.4
            )
            : g / 12.92;


    b =
        b > 0.04045
            ? Math.pow(
                (b + 0.055) / 1.055,
                2.4
            )
            : b / 12.92;


    const X =
        (
            r * 0.4124 +
            g * 0.3576 +
            b * 0.1805
        ) / 0.95047;


    const Y =
        (
            r * 0.2126 +
            g * 0.3576 +
            b * 0.0722
        ) / 1.00000;


    const Z =
        (
            r * 0.0193 +
            g * 0.1192 +
            b * 0.9505
        ) / 1.08883;


    const f = value => {

        return value > 0.008856

            ? Math.pow(
                value,
                1 / 3
            )

            : (7.787 * value) +
              (16 / 116);
    };


    const fx = f(X);
    const fy = f(Y);
    const fz = f(Z);


    const L =
        (116 * fy) - 16;

    const a =
        500 * (fx - fy);

    const labB =
        200 * (fy - fz);


    return {

        L: L,

        a: a,

        b: labB
    };
}


// =========================
// โหลดข้อมูลมาตรฐาน
// =========================

async function loadCalibration(testType) {

    let file = "";


    if (testType === "biuret") {

        file =
            "data/biuret.json";
    }


    if (testType === "benedict") {

        file =
            "data/benedict.json";
    }


    try {

        const response =
            await fetch(file);


        if (!response.ok) {

            throw new Error(
                "ไม่พบไฟล์ข้อมูลมาตรฐาน"
            );
        }


        const data =
            await response.json();


        console.log(
            "Calibration data:",
            data
        );


        return data;

    } catch (error) {

        console.error(error);

        alert(
            "ไม่สามารถโหลดข้อมูลมาตรฐานได้"
        );

        return null;
    }
}


// =========================
// หาระดับสีที่ใกล้ที่สุด
// =========================

function findClosestCalibration(
    lab,
    testType
) {

    const storageKey =
        "BioTestCalibration_" +
        testType;


    const savedData =
        localStorage.getItem(
            storageKey
        );


    if (!savedData) {

        return null;
    }


    const data =
        JSON.parse(savedData);


    const levels = [

        "ไม่พบ",

        "0.01",

        "0.05",

        "0.10",

        "0.25",

        "0.50",

        "0.75",

        "1.00"
    ];


    let bestResult =
        null;

    let smallestDistance =
        Infinity;


    levels.forEach(level => {

        const samples =
            data.filter(
                sample =>
                    sample.level === level
            );


        if (samples.length === 0) {

            return;
        }


        let totalL = 0;
        let totalA = 0;
        let totalB = 0;

        let validSamples = 0;


        samples.forEach(sample => {

            if (!sample.lab) {

                return;
            }


            totalL +=
                sample.lab.L;

            totalA +=
                sample.lab.a;

            totalB +=
                sample.lab.b;


            validSamples++;
        });


        if (validSamples === 0) {

            return;
        }


        const avgL =
            totalL /
            validSamples;

        const avgA =
            totalA /
            validSamples;

        const avgB =
            totalB /
            validSamples;


        // ระยะห่างสีใน LAB

        const distance =
            Math.sqrt(

                Math.pow(
                    lab.L - avgL,
                    2
                ) +

                Math.pow(
                    lab.a - avgA,
                    2
                ) +

                Math.pow(
                    lab.b - avgB,
                    2
                )
            );


        if (
            distance <
            smallestDistance
        ) {

            smallestDistance =
                distance;


            bestResult = {

                level:
                    level,

                distance:
                    distance,

                averageLab: {

                    L:
                        avgL,

                    a:
                        avgA,

                    b:
                        avgB
                }
            };
        }

    });


    return bestResult;
}