const rptfilter = document.querySelector('input#rptfilter');
const rptlist = document.querySelector('select#rptlist');
const rptlogText = document.querySelector('textarea#rptlogText');
const rptgetlink = document.querySelector('input#rptgetlink');
const rptdownload = document.querySelector('input#rptdownload');
const rptautosync = document.querySelector('i#rptautosync');
var rptLogcache = "";
var autoSyncRpt;

window.addEventListener('load', init);

async function init() {
    await fetchRptList();
    await fetchRptLog();
    rptlist.addEventListener('change', fetchRptLog);
    rptautosync.addEventListener('click', rptAutoupdate);
    rptdownload.addEventListener('click', downloadrptlog);
    rptgetlink.addEventListener('click', getlinkrptlog);
    rptfilter.addEventListener('keyup',filterFNRpt);
};

function fetchRptList() {
    return fetch('/getRptList').then(data => data.json()).then(rpts => rpts.reverse()).then(rpts => rpts.forEach(rpt => {
        const option = document.createElement('OPTION');
        option.value = rpt.rpt;
        option.textContent = rpt.name;

        rptlist.append(option);
    }));
};

function fetchRptLog() {
    const data = { rpt: rptlist.selectedOptions[0].value };
    return fetch('/getRptLog', {
        method: 'post',
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
    }).then(data => data.json()).then(rpt => {
        rptLogcache = rpt.rptlog;
        rptlogText.textContent = rpt.rptlog;
    });
};

function rptAutoupdate({ target }) {
    if (target.className.includes('active')) {
        target.classList.remove('active');
        clearInterval(autoSyncRpt);
    } else {
        target.classList.add('active');
        autoSyncRpt = setInterval(fetchRptLog, 1000);
    };
};

function downloadrptlog() {
    const data = { rpt: rptlist.selectedOptions[0].value };
    return fetch('/downloadRptLog', {
        method: 'post',
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
    }).then(response => response.blob())
    .then(rpt => {
        var url = window.URL.createObjectURL(rpt);
        var a = document.createElement('a');
        a.href = url;
        a.download = `${rptlist.selectedOptions[0].text}.txt`;
        document.body.appendChild(a);
        a.click();    
        a.remove();
    });
};

function getlinkrptlog() {
    const data = { 
        rpt: rptlist.selectedOptions[0].value,
        name: rptlist.selectedOptions[0].text
    };
    return fetch('/getLinkRptLog', {
        method: 'post',
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
    }).then(data => data.json()).then(rpt => {
        window.open(rpt.rpturl,'_blank');
    });
};

function filterFNRpt(e) {
    const rows = (rptLogcache).split(/\n/g);
    const fil = rows.filter(row => (row.toLowerCase()).includes(e.target.value.toLowerCase()));
    rptlogText.textContent = fil.join('\n');
};