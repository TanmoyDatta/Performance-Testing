/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 98.35312140942168, "KoPercent": 1.6468785905783225};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.1451551129835312, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.08846153846153847, 500, 1500, "Login (post)"], "isController": false}, {"data": [0.1773076923076923, 500, 1500, "homepage and login/chart/data-166"], "isController": false}, {"data": [0.1376923076923077, 500, 1500, "home page "], "isController": false}, {"data": [0.36363636363636365, 500, 1500, "home page -0"], "isController": false}, {"data": [0.17576923076923076, 500, 1500, "login Page"], "isController": false}, {"data": [0.09090909090909091, 500, 1500, "home page -1"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 5222, 86, 1.6468785905783225, 3110.185369590202, 289, 21029, 2501.0, 5766.0, 7474.949999999996, 20257.0, 48.96573711156536, 155.69768351602497, 40.68334321317724], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Login (post)", 1300, 18, 1.3846153846153846, 4312.704615384612, 365, 20315, 3798.0, 7793.000000000001, 8946.400000000001, 18752.830000000027, 15.406494429959707, 13.746384473512682, 16.517331380362645], "isController": false}, {"data": ["homepage and login/chart/data-166", 1300, 28, 2.1538461538461537, 2615.6053846153823, 289, 20929, 2312.0, 4491.400000000001, 5208.650000000001, 15398.950000000023, 12.406711076329904, 12.30388412072207, 12.769844101921132], "isController": false}, {"data": ["home page ", 1300, 24, 1.8461538461538463, 3103.3869230769205, 310, 20857, 2550.5, 5132.1, 6128.75, 20279.95, 12.419867967249765, 101.03468360087798, 10.981161732356622], "isController": false}, {"data": ["home page -0", 11, 0, 0.0, 1219.4545454545455, 516, 3802, 591.0, 3660.2000000000007, 3802.0, 3802.0, 0.3346822040344418, 0.4075373855234734, 0.2915395761706271], "isController": false}, {"data": ["login Page", 1300, 8, 0.6153846153846154, 2322.921538461538, 511, 21029, 2014.0, 3583.8, 4392.750000000004, 14126.910000000007, 16.64213019266466, 45.29446019090444, 5.700092111790309], "isController": false}, {"data": ["home page -1", 11, 8, 72.72727272727273, 15179.090909090908, 860, 20269, 20253.0, 20268.2, 20269.0, 20269.0, 0.22300160155695664, 0.576094069931275, 0.05432496401565066], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 159.89.38.11:80 failed to respond", 52, 60.46511627906977, 0.995787054768288], "isController": false}, {"data": ["503/Service Unavailable", 7, 8.13953488372093, 0.13404825737265416], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 159.89.38.11:80 [/159.89.38.11] failed: Connection timed out: connect", 1, 1.1627906976744187, 0.019149751053236307], "isController": false}, {"data": ["401/Unauthorized", 11, 12.790697674418604, 0.21064726158559938], "isController": false}, {"data": ["419/unknown status", 15, 17.441860465116278, 0.2872462657985446], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 5222, 86, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 159.89.38.11:80 failed to respond", 52, "419/unknown status", 15, "401/Unauthorized", 11, "503/Service Unavailable", 7, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 159.89.38.11:80 [/159.89.38.11] failed: Connection timed out: connect", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Login (post)", 1300, 18, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 159.89.38.11:80 failed to respond", 10, "419/unknown status", 8, "", "", "", "", "", ""], "isController": false}, {"data": ["homepage and login/chart/data-166", 1300, 28, "401/Unauthorized", 11, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 159.89.38.11:80 failed to respond", 10, "419/unknown status", 7, "", "", "", ""], "isController": false}, {"data": ["home page ", 1300, 24, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 159.89.38.11:80 failed to respond", 24, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["login Page", 1300, 8, "503/Service Unavailable", 7, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 159.89.38.11:80 [/159.89.38.11] failed: Connection timed out: connect", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["home page -1", 11, 8, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 159.89.38.11:80 failed to respond", 8, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
