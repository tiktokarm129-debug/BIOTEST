function selectTest(testType) {

    if (testType === "biuret") {
        openCamera("biuret");
    }

    if (testType === "benedict") {
        openCamera("benedict");
    }
}