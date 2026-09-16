let cameraStream = null;
let currentTestType = null;
let calibrationTestType = null;
let selectedCalibrationLevel = "ไม่พบ";
let calibrationSamples = [];
function loadSavedCalibration(testType) {

    const storageKey =
        "BioTestCalibration_" + testType;

    const savedData =
        localStorage.getItem(storageKey);

    if (savedData) {

        calibrationSamples =
            JSON.parse(savedData);

        console.log(
            "โหลด Calibration เดิม:",
            calibrationSamples
        );
    }
}

// =========================
// เปิดกล้อง
// =========================

async function openCamera(testType) {

    currentTestType = testType;

    const main = document.querySelector(".main");
    const cameraPage = document.getElementById("cameraPage");
    const cameraTitle = document.getElementById("cameraTitle");

    main.classList.add("hidden");
    cameraPage.classList.remove("hidden");

    if (testType === "biuret") {

        cameraTitle.textContent =
            "ตรวจโปรตีน — Biuret";

    } else {

        cameraTitle.textContent =
            "ตรวจน้ำตาลรีดิวซ์ — Benedict";

    }

    try {

        cameraStream =
            await navigator.mediaDevices.getUserMedia({

                video: {
                    facingMode: {
                        ideal: "environment"
                    },

                    width: {
                        ideal: 1920
                    },

                    height: {
                        ideal: 1080
                    }
                },

                audio: false
            });

        const video =
            document.getElementById("cameraVideo");

        video.srcObject = cameraStream;

        await video.play();

    } catch (error) {

        console.error(error);

        alert(
            "ไม่สามารถเปิดกล้องได้ กรุณาอนุญาตการใช้กล้อง"
        );

    }
}


// =========================
// ปิดกล้อง
// =========================

function closeCamera() {

    if (cameraStream) {

        cameraStream
            .getTracks()
            .forEach(track => track.stop());

        cameraStream = null;
    }

    document
        .getElementById("cameraPage")
        .classList.add("hidden");

    document
        .querySelector(".main")
        .classList.remove("hidden");
}


// =========================
// ถ่ายภาพ
// =========================

function captureImage() {

    const video =
        document.getElementById("cameraVideo");

    const canvas =
        document.getElementById("captureCanvas");

    if (!video.videoWidth) {

        alert("กล้องยังไม่พร้อม");

        return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx =
        canvas.getContext("2d");

    ctx.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
    );

    if (calibrationTestType) {

    analyzeCalibrationImage(
        canvas,
        calibrationTestType
    );

} else {

    analyzeImage(
        canvas,
        currentTestType
    );
}
}


// =========================
// Calibration
// =========================

function openCalibration(testType) {

    calibrationTestType = testType;

    document
        .querySelector(".main")
        .classList.add("hidden");

    document
        .getElementById("cameraPage")
        .classList.add("hidden");

    document
        .getElementById("calibrationPage")
        .classList.remove("hidden");

    const title =
        document.getElementById("calibrationTestName");

    if (testType === "biuret") {

        title.textContent =
            "สอบเทียบสี — Biuret";

    } else {

        title.textContent =
            "สอบเทียบสี — Benedict";

    }
}


// =========================
// ปิด Calibration
// =========================

function closeCalibration() {

    document
        .getElementById("calibrationPage")
        .classList.add("hidden");

    document
        .querySelector(".main")
        .classList.remove("hidden");

    calibrationTestType = null;
}


// =========================
// เปิดกล้องสำหรับ Calibration
// =========================

async function captureCalibration() {

    if (!calibrationTestType) {

        alert(
            "ยังไม่ได้เลือกชนิดการทดสอบ"
        );


        return;
    }

    document
        .getElementById("calibrationPage")
        .classList.add("hidden");

    await openCamera(calibrationTestType);
}
// =========================
// เลือกระดับ Calibration
// =========================


// =========================
// วิเคราะห์ภาพ Calibration
// =========================
function setCalibrationLevel(level) {

    selectedCalibrationLevel = level;
    console.log(
    "เลือก Calibration ระดับ:",
    selectedCalibrationLevel
);

    const levelDisplay =
        document.getElementById("calibrationLevel");

    levelDisplay.textContent = level;

    // นับเฉพาะภาพของระดับที่เลือก
    const currentLevelCount =
        calibrationSamples.filter(
            sample =>
                sample.test === calibrationTestType &&
                sample.level === selectedCalibrationLevel
        ).length;

    const sampleCount =
        document.getElementById("calibrationSampleCount");

    if (sampleCount) {

        sampleCount.textContent =
            currentLevelCount;
    }

    console.log(
        "Calibration level:",
        selectedCalibrationLevel
    );

    console.log(
        "จำนวนภาพระดับนี้:",
        currentLevelCount
    );
}
function analyzeCalibrationImage(canvas, testType) {

    const ctx = canvas.getContext("2d");

    const width = canvas.width;
    const height = canvas.height;

    const roiSize =
        Math.floor(Math.min(width, height) * 0.3);

    const startX =
        Math.floor((width - roiSize) / 2);

    const startY =
        Math.floor((height - roiSize) / 2);

    const imageData =
        ctx.getImageData(
            startX,
            startY,
            roiSize,
            roiSize
        );

    let totalR = 0;
    let totalG = 0;
    let totalB = 0;
    let count = 0;

    for (let i = 0; i < imageData.data.length; i += 4) {

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

    console.log("Calibration");
    console.log("Test:", testType);
    console.log("Level:", calibrationTestType);
    console.log("RGB:", r, g, b);
    const hsv = rgbToHsv(r, g, b);
const lab = rgbToLab(r, g, b);

calibrationSamples.push({
    test: testType,
    level: selectedCalibrationLevel,

    rgb: {
        r: r,
        g: g,
        b: b
    },

    hsv: hsv,

    lab: lab
});
localStorage.setItem(
    "BioTestCalibration_" + testType,
    JSON.stringify(calibrationSamples)
);

console.log(
    "บันทึก Calibration:",
    calibrationSamples
);

        
    const calibrationData = {

        test: testType,

        level: selectedCalibrationLevel,

        rgb: {
            r: r,
            g: g,
            b: b
        },

        hsv: {
            h: hsv.h,
            s: hsv.s,
            v: hsv.v
        },

        lab: {
            L: lab.L,
            a: lab.a,
            b: lab.b
        },

        timestamp: new Date().toISOString()
    };

    calibrationSamples.push(calibrationData);

    const sampleCount =
        document.getElementById("calibrationSampleCount");

    if (sampleCount) {

    const currentLevelCount =
        calibrationSamples.filter(
            sample =>
                sample.test === testType &&
                sample.level === selectedCalibrationLevel
        ).length;

    sampleCount.textContent =
        currentLevelCount;
}

    console.log(
        "Calibration data:",
        calibrationData
    );

    alert(
    "บันทึกข้อมูลสีมาตรฐานแล้ว\n\n" +

    "การทดสอบ: " +
    testType +

    "\nระดับ: " +
    selectedCalibrationLevel +

    "\n\nRGB: " +
    r + ", " +
    g + ", " +
    b +

    "\n\nHSV: " +
    hsv.h.toFixed(1) +
    ", " +
    hsv.s.toFixed(1) +
    ", " +
    hsv.v.toFixed(1) +

    "\n\nCIELAB: " +
    lab.L.toFixed(1) +
    ", " +
    lab.a.toFixed(1) +
    ", " +
    lab.b.toFixed(1)
);
}

// =========================
// บันทึกระดับ Calibration
// =========================

function saveCalibrationLevel() {

    if (!calibrationTestType) {

        alert("ยังไม่ได้เลือกการทดสอบ");

        return;
    }

    const levelSamples =
        calibrationSamples.filter(
            sample =>
                sample.test === calibrationTestType &&
                sample.level === selectedCalibrationLevel
        );

    if (levelSamples.length === 0) {

        alert(
            "ยังไม่มีข้อมูลของระดับ " +
            selectedCalibrationLevel +
            "\nกรุณาถ่ายภาพมาตรฐานก่อน"
        );

        return;
    }

    // โหลดข้อมูลเดิมจากเครื่อง
    const storageKey =
        "BioTestCalibration_" +
        calibrationTestType;

    let savedData = [];

    const oldData =
        localStorage.getItem(storageKey);

    if (oldData) {

        savedData =
            JSON.parse(oldData);
    }

    // ลบข้อมูลระดับเดิมออกก่อน
    savedData =
        savedData.filter(
            sample =>
                sample.level !== selectedCalibrationLevel
        );

    // เพิ่มข้อมูลชุดใหม่
    savedData.push(...levelSamples);

    // บันทึกลงเครื่อง
    localStorage.setItem(
        storageKey,
        JSON.stringify(savedData)
    );

    console.log(
        "บันทึก Calibration สำเร็จ:",
        savedData
    );

    alert(
        "บันทึกระดับเรียบร้อยแล้ว\n\n" +

        "การทดสอบ: " +
        calibrationTestType +

        "\nระดับ: " +
        selectedCalibrationLevel +

        "\nจำนวนตัวอย่าง: " +
        levelSamples.length +
        " รูป"
    );
}
// =========================
// ดูข้อมูล Calibration
// =========================

function viewCalibrationData() {

    if (!calibrationTestType) {

        alert("ยังไม่ได้เลือกการทดสอบ");

        return;
    }

    const storageKey =
        "BioTestCalibration_" +
        calibrationTestType;

    const savedData =
        localStorage.getItem(storageKey);

    if (!savedData) {

        alert(
            "ยังไม่มีข้อมูล Calibration ของ " +
            calibrationTestType
        );

        return;
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

    let message =
        "ข้อมูล Calibration\n\n";

    message +=
        "การทดสอบ: " +
        calibrationTestType +
        "\n\n";

    levels.forEach(level => {

        const samples =
            data.filter(
                sample =>
                    sample.level === level
            );

        message +=
            level +
            " → " +
            samples.length +
            " รูป\n";
    });

    alert(message);

    console.log(
        "Calibration Data:",
        data
    );
}
// =========================
// คำนวณค่าเฉลี่ยสี Calibration
// =========================

function calculateCalibrationAverage() {

    if (!calibrationTestType) {

        alert("ยังไม่ได้เลือกการทดสอบ");

        return;
    }

    const storageKey =
        "BioTestCalibration_" +
        calibrationTestType;

    const savedData =
        localStorage.getItem(storageKey);

    if (!savedData) {

        alert(
            "ยังไม่มีข้อมูล Calibration ของ " +
            calibrationTestType
        );

        return;
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

    let averages = [];

    levels.forEach(level => {

        const samples =
            data.filter(
                sample =>
                    sample.level === level
            );

        if (samples.length === 0) {
            return;
        }

        let totalR = 0;
        let totalG = 0;
        let totalB = 0;

        let totalH = 0;
        let totalS = 0;
        let totalV = 0;

        let totalL = 0;
        let totalA = 0;
        let totalLabB = 0;

        samples.forEach(sample => {

            totalR += sample.rgb.r;
            totalG += sample.rgb.g;
            totalB += sample.rgb.b;

            totalH += sample.hsv.h;
            totalS += sample.hsv.s;
            totalV += sample.hsv.v;

            totalL += sample.lab.L;
            totalA += sample.lab.a;
            totalLabB += sample.lab.b;
        });

        averages.push({

            test: calibrationTestType,

            level: level,

            sampleCount: samples.length,

            rgb: {
                r: totalR / samples.length,
                g: totalG / samples.length,
                b: totalB / samples.length
            },

            hsv: {
                h: totalH / samples.length,
                s: totalS / samples.length,
                v: totalV / samples.length
            },

            lab: {
                L: totalL / samples.length,
                a: totalA / samples.length,
                b: totalLabB / samples.length
            }
        });
    });


    // =========================
    // สร้างตารางผลลัพธ์
    // =========================

    let resultHTML = "";

    resultHTML += `
        <div class="calibration-average-result">

            <h3>
                📊 ค่าเฉลี่ย Calibration
            </h3>

            <p>
                การทดสอบ:
                <strong>${calibrationTestType}</strong>
            </p>

            <div class="average-table-container">

                <table class="average-table">

                    <thead>

                        <tr>
                            <th>ระดับ</th>
                            <th>จำนวนรูป</th>
                            <th>RGB</th>
                            <th>HSV</th>
                            <th>LAB</th>
                        </tr>

                    </thead>

                    <tbody>
    `;


    averages.forEach(avg => {

        resultHTML += `

            <tr>

                <td>
                    <strong>
                        ${avg.level}
                    </strong>
                </td>

                <td>
                    ${avg.sampleCount}
                </td>

                <td>
                    ${avg.rgb.r.toFixed(1)},
                    ${avg.rgb.g.toFixed(1)},
                    ${avg.rgb.b.toFixed(1)}
                </td>

                <td>
                    ${avg.hsv.h.toFixed(1)},
                    ${avg.hsv.s.toFixed(1)},
                    ${avg.hsv.v.toFixed(1)}
                </td>

                <td>
                    ${avg.lab.L.toFixed(1)},
                    ${avg.lab.a.toFixed(1)},
                    ${avg.lab.b.toFixed(1)}
                </td>

            </tr>

        `;
    });


    resultHTML += `

                    </tbody>

                </table>

            </div>

        </div>
    `;


    // =========================
    // แสดงผลบนหน้าเว็บ
    // =========================

    let resultBox =
        document.getElementById(
            "calibrationAverageResult"
        );


    if (!resultBox) {

        resultBox =
            document.createElement("div");

        resultBox.id =
            "calibrationAverageResult";

        document
            .getElementById("calibrationPage")
            .appendChild(resultBox);
    }


    resultBox.innerHTML =
        resultHTML;


    // เลื่อนหน้าจอไปยังผลลัพธ์

    resultBox.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });


    return averages;
}