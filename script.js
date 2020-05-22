var loadData = {};

loadData.response = {}; // server response
loadData.handleResponse = {};

//takes data from POST API when page loading
loadData.onLoad = function (e) {

    var httprequest = new XMLHttpRequest();
    httprequest.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            loadData.handleResponse(this.response);
            loadData.response = this.response;
        }
    };
    // string for request data
    var myJson = {
        'data': ''
    };

    //create and send POST request
    httprequest.open("POST", "http://krapipl.imumk.ru:8082/api/mobilev1/update", true);
    httprequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    httprequest.responseType = 'json';
    httprequest.send(myJson);
};

//handle response
// filling filters from responce and inserting all loaded items into <UL id="books">
loadData.handleResponse = function (response) {
    var items = response['items'];

    var Subjects = new Set();
    var Genres = new Set();
    var Grades = new Set();

    //get set of values for filters
    for (i = 0; i < items.length; i++) {
        Subjects.add(items[i].subject);
        Genres.add(items[i].genre);

        // parse Grade, because in may contain several grades in one line
        let years = items[i].grade.split(';');
        for (j = 0; j < years.length; j++) {
            Grades.add(years[j]);
        }

    }

    loadData.setOptionsForFilter("subject", Subjects, "Все предметы");
    loadData.setOptionsForFilter("genre", Genres, "Все жанры");
    loadData.setOptionsForFilter("grade", Grades, "Все классы");

    loadData.loadContentOnUList("books", items);
}

//load all values from optionSet to <select> tag
loadData.setOptionsForFilter = function (filterName, optionSet, title) {
    var select = document.getElementById(filterName);

    // add value for "All values"
    var titleOp = new Option(title, title);
    select.append(titleOp);

    //add values parsed from json
    var optionArr = Array.from(optionSet);

    // for grades (i.e. numbers) sorting uses numerical order
    // for other filter values -- alphabetical
    if (filterName == "grade") {
        optionArr.sort(loadData.compareNum);
    } else {
        optionArr.sort();
    }

    // iserting new <option> tags inot <select>
    for (i = 0; i < optionArr.length; i++) {
        var newOption = new Option(optionArr[i], optionArr[i]);
        select.append(newOption);
    }
}

//loads <li> from containerList
loadData.loadContentOnUList = function (container, contentList) {
    var content = document.getElementById(container);

    for (i = 0; i < contentList.length; i++) {
        var newLi = document.createElement("li");
        newLi.setAttribute("name", "book_item");

        //insert image
        var divImg = document.createElement("div");
        divImg.setAttribute("class", "picture");
        Img = document.createElement("img");
        Img.src = "demoImage.jpeg";
        divImg.appendChild(Img);

        //insert text for image
        var divText = document.createElement("div");
        divText.setAttribute("class", "info");

        //Subject
        p = document.createElement("p");
        p.innerText = contentList[i].subject;
        p.setAttribute("class", "title");
        divText.appendChild(p);

        //Grade
        p = document.createElement("p");
        var temp = contentList[i].grade.split(';');
        // choose right for word "класс"
        if (temp.length == 1) {
            p.innerText = contentList[i].grade + " класс";
        } else {
            p.innerText = temp[0] + "-" + temp[temp.length - 1] + " классы";
        }
        p.setAttribute("class", "grade");
        divText.appendChild(p);

        //Genre
        p = document.createElement("p");
        p.innerText = contentList[i].genre;
        p.setAttribute("class", "genre");
        divText.appendChild(p);

        //Price
        //by default price in roubles
        //prices in bonuses hiden while press the currency_button
        p = document.createElement("p");
        p.innerText = "Цена: " + contentList[i].price + " руб.";
        p.setAttribute("class", "rubles");
        p.hidden = false;
        divText.appendChild(p);

        p = document.createElement("p");
        p.innerText = "Цена: " + contentList[i].priceBonus + " бон.";
        p.setAttribute("class", "bonuses");
        p.hidden = "true";
        divText.appendChild(p);

        newLi.appendChild(divImg);
        newLi.appendChild(divText);

        content.appendChild(newLi);


    }
}


loadData.compareNum = function (a, b) {
    return a - b;
}

loadData.delUl = function (id) {
    var elem = document.getElementById(id);
    elem.innerHTML = '';
}

//reacts to changing any filter element
loadData.changeFilter = function (e) {
    // get array of filtered elements
    var filtered = loadData.filtering();

    //clear <ul id="books" and inserting filtered elements
    loadData.delUl("books");
    if (filtered.length != 0) {
        loadData.loadContentOnUList("books", filtered);
    } else {

    }
}

//checks the filters from form and returns filtered result array
loadData.filtering = function () {
    var subject = document.getElementById("subject").value;
    genre = document.getElementById("genre").value;
    grade = document.getElementById("grade").value;

    items = loadData.response['items'];
    result = [];

    if (subject == "Все предметы") {
        subject = '';
    }
    if (genre == "Все жанры") {
        genre = '';
    }
    if (grade == "Все классы") {
        grade = '';
    }

    for (i = 0; i < items.length; i++) {
        var checked = 0;

        if (subject != '') {
            if (subject == items[i].subject) {
                checked++;
            }
        } else {
            checked++;
        }
        if (genre != '') {
            if (genre == items[i].genre) {
                checked++
            }
        } else {
            checked++;
        }
        if (grade != '') {
            var temp = items[i].grade.split(';');
            for (j = 0; j < temp.length; j++) {
                if (grade == temp[j]) {
                    checked++;
                    break;
                }
            }
        } else {
            checked++;
        }

        if (checked == 3) {
            result.push(items[i]);
        }
    }
    return result;
}

loadData.search = function (e) {
    var template = document.getElementById("search_input").value.toLowerCase();
    items = loadData.response['items'];
    result = [];
    for (i = 0; i < items.length; i++) {
        var title = items[i].title.toLowerCase();
        if (title.indexOf(template) >= 0) {
            result.push(items[i]);
            console.log('OK');
        }

    }

    loadData.delUl("books");
    loadData.loadContentOnUList("books", result);
}

loadData.changeCurrency = function (e) {
    var btn = document.getElementById("currency_button");

    allRubItems = document.getElementById("books").querySelectorAll('p.rubles');

    allBonusItems = document.getElementById("books").querySelectorAll('p.bonuses');

    if (btn.innerText == "Цена в бонусах") {
        btn.innerText = "Цена в рублях";
        for (i = 0; i < allRubItems.length; i++) {
            allRubItems[i].hidden = true;
            console.log(allRubItems[i]);
            allBonusItems[i].hidden = false;
            console.log(allBonusItems[i]);
        }

    } else {
        btn.innerText = "Цена в бонусах";
        for (i = 0; i < allRubItems.length; i++) {
            allRubItems[i].hidden = false;

            allBonusItems[i].hidden = true;
        }
    }
}


window.onload = loadData.onLoad();
