mdui.setColorScheme('#1E88E5');
const $ = (query) => mdui.$(query)[0];
const doms = {
    inputBox: $('.input__input'),
    resultDoms: {
        resultSum: $('#result__sum'), // 总和
        resultAverage: $('#result__average'), // 平均数
        resultQ1: $('#result__q1'), // 第一四分位数
        resultMedian: $('#result__median'), // 中位数
        resultQ3: $('#result__q3'), // 第三四分位数
        resultMode: $('#result__mode'), // 众数
        resultSS: $('#result__ss'), // 离差平方和
        resultVariance: $('#result__variance'), // 方差
        resultSigma: $('#result__sigma'), // 标准差
        resultMeanDeviation: $('#result__mean_deviation'), // 平均差
        resultRange: $('#result__range'), // 极差
        resultIQR: $('#result__iqr'), // 四分位距
    },
};

function calcMedian(data) {
    const sortedData = data.sort((a, b) => a - b);
    const middleIndex = Math.floor(sortedData.length / 2);
    if (sortedData.length % 2 === 0) {
        return (sortedData[middleIndex - 1] + sortedData[middleIndex]) / 2;
    } else {
        return sortedData[middleIndex];
    };
};

class StatisticsSolver {
    constructor() {
        this.inputData = [];
        this.resultData = {};
    };
    sum() {
        return this.inputData.reduce((sum, cur) => sum + cur, 0);
    };
    average() {
        return this.sum() / this.inputData.length;
    };
    q1() {
        const sortedData = this.inputData.sort((a, b) => a - b);
        const middleIndex = Math.floor(sortedData.length / 2);
        const remainData = sortedData.slice(0, middleIndex);
        return calcMedian(remainData);
    };
    median() {
        const sortedData = this.inputData.sort((a, b) => a - b);
        return calcMedian(sortedData);
    };
    q3() {
        const sortedData = this.inputData.sort((a, b) => a - b);
        const middleIndex = Math.floor(sortedData.length / 2);
        const remainData = sortedData.slice(middleIndex);
        return calcMedian(remainData);
    };
    mode() {
        const frequency = {};
        this.inputData.forEach((item) => {
            if (frequency[item]) {
                frequency[item]++;
            } else {
                frequency[item] = 1;
            };
        });
        const maxFrequency = Math.max(...Object.values(frequency));
        const modes = [];
        Object.keys(frequency).forEach((key) => {
            if (frequency[key] === maxFrequency) {
                modes.push(Number(key));
            };
        });
        // 如果所有数出现频率都是1，则没有众数
        if (maxFrequency === 1) {
            return [];
        };
        return modes;
    };
    ss() {
        const average = this.average();
        return this.inputData.reduce((sum, cur) => sum + Math.pow(cur - average, 2), 0);
    };
    variance() {
        const average = this.average();
        return this.inputData.reduce((sum, cur) => sum + Math.pow(cur - average, 2), 0) / this.inputData.length;
    };
    sigma() {
        return Math.sqrt(this.variance());
    };
    meanDeviation() {
        const average = this.average();
        return this.inputData.reduce((sum, cur) => sum + Math.abs(cur - average), 0) / this.inputData.length;
    };
    range() {
        return Math.max(...this.inputData) - Math.min(...this.inputData);
    };
    iqr() {
        return this.q3() - this.q1();
    };
};

const solver = new StatisticsSolver();

function calculate() {
    const input = doms.inputBox.value.trim();
    if (input.length === 0) {
        Object.values(doms.resultDoms).forEach(element => {
            element.value = '';
        });
        return;
    };
    const data = input.split(/[\s,，]+/).map((item) => Number(item));
    solver.inputData = data;
    solver.resultData = {
        sum: solver.sum(),
        average: solver.average(),
        q1: solver.q1(),
        median: solver.median(),
        q3: solver.q3(),
        mode: solver.mode(),
        ss: solver.ss(),
        variance: solver.variance(),
        sigma: solver.sigma(),
        meanDeviation: solver.meanDeviation(),
        range: solver.range(),
        iqr: solver.iqr(),
    };
    let index = 0;
    Object.values(solver.resultData).forEach(value => {
        Object.values(doms.resultDoms)[index].value = value;
        index++;
    });
};

doms.inputBox.oninput = calculate;