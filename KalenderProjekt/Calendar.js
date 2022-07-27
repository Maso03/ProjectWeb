import { dateString, getDayIndex, addDays } from "./helper.js";
import { Event, MODE } from "./Event.js";
var iduser = prompt("ID_NUMBER/MATRIKELNUMMER");
export {iduser};

export class Calendar {
    constructor() {
        this.mode = MODE.VIEW;
        this.events = {};
        this.weekOffset = 0;
        this.readyToTrash = false;
        this.slotHeight = 30;
        this.weekStart = null;
        this.weekEnd = null;
        this.eventsLoaded = false;
    }

    setup() {
        this.setupTimes();
        this.setupDays();
        this.calculateCurrentWeek();
        this.showWeek();
        this.loadEvents();
        this.setupControls();
    }



    setupControls() {
        $("#nextWeekBtn").click(() => this.changeWeek(1));
        $("#prevWeekBtn").click(() => this.changeWeek(-1));
        $("#addButton").click(() => this.addNewEvent());
        $("#trashButton").click(() => this.trash());
        $("#loginButton").click(() => this.view());
        $("#cancelButton").click(() => this.closeModal());
        $("#cancelButton2").click(() => this.closeView());
        $(".color").click(this.changeColor);
    }



    view(){
        $("#listTitle").text("List of all Events");
        $("#listView").fadeIn(200);
        $("#listTitle").focus();
        $("#calendar").addClass("opaque");
        $("#listview")

        fetch("http://dhbw.radicalsimplicity.com/calendar/" + iduser + "/events", {
            method: 'GET',
        }).then((response) => {
            return response.text();
        }).then((text) => {
            console.log(text);
            let eventsArray = JSON.parse(text);
                console.log(eventsArray[8]);

                let items;
                for(let i = 0; i<eventsArray.length; i++){
                    let zahl = i+1;
                 //  document.getElementById("list").insertAdjacentHTML("beforeend", "<tr>" + zahl + ".Event");
                    items = `<span>Title: ${eventsArray[i].title}</span> </br>`; // Event onclick mit rein
                   document.getElementById("list").insertAdjacentHTML("beforeend", items);
                 //   items = "Description: " + `${eventsArray[i].description}</br>`;
                 //   document.getElementById("list").insertAdjacentHTML("beforeend", items);

                 let date = eventsArray[i].start.split("T")[0];
                 eventsArray[i].date = date;
            
                 items = `<span>Date: ${eventsArray[i].date}</span></br>`; // Event onclick mit rein
                 document.getElementById("list").insertAdjacentHTML("beforeend", items);

                 let timeStart = eventsArray[i].start.split("T")[1];
                 eventsArray[i].start = timeStart;
            
                 items = `<span>Start Time: ${eventsArray[i].start}</span></br>`; // Event onclick mit rein
                 document.getElementById("list").insertAdjacentHTML("beforeend", items);


                 let timeEnd = eventsArray[i].end.split("T")[1];
                 eventsArray[i].end = timeEnd;

                 items = `<span>End Time: ${eventsArray[i].end}</span></br>`; // Event onclick mit rein
                 document.getElementById("list").insertAdjacentHTML("beforeend", items);


                items = `</br>`;
                   document.getElementById("list").insertAdjacentHTML("beforeend", items);


                
              }


        });
    }

   /* login() {
            let idevent = prompt("ID from Event");
            fetch("http://dhbw.radicalsimplicity.com/calendar/" + id + "/events/" + idevent, {
                method: 'GET',
            }).then((response) => {
                return response.text();
            }).then((text) => {
                console.log(text);
                let eventsArray = JSON.parse(text);

                eventsArray.forEach(event => {
                    let date = event["start"].split("T")[0];
                    event["date"] = date;

                    if (this.events[date] == undefined) this.events[date] = {};
                    this.events[date][event.id] = event;
                });

                if (this.events) {
                    for (const date of Object.keys(this.events)) {
                        for (const id of Object.keys(this.events[date])) {
                            const event = new Event(this.events[date][id]);
                            this.events[date][id] = event;
                        }
                    }
                }
                this.eventsLoaded = true;


                if (this.events) {
                    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
                        const date = dateString(addDays(this.weekStart, dayIndex));
                        if (this.events[date]) {
                            for (const event of Object.values(this.events[date])) {
                                event.showIn(this);
                            }
                        }
                    }
                } else {
                    this.events = {};
                }

            }).catch((error) => {
                console.error(error);
            });
    

  }*/






    setupTimes() {
        const header = $("<div></div>").addClass("columnHeader");
        const slots = $("<div></div>").addClass("slots");
        for (let hour = 0; hour < 24; hour++) {
            $("<div></div>")
                .attr("data-hour", hour)
                .addClass("time")
                .text(`${hour}:00 - ${hour + 1}:00`)
                .appendTo(slots);
        }
        $(".dayTime").append(header).append(slots);
    }

    setupDays() {
        const cal = this;
        $(".day").each(function () {
            const dayIndex = parseInt($(this).attr("data-dayIndex"));
            const name = $(this).attr("data-name");
            const header = $("<div></div>").addClass("columnHeader").text(name);
            const slots = $("<div></div>").addClass("slots");
            $("<div></div>").addClass("dayDisplay").appendTo(header);
            for (let hour = 0; hour < 24; hour++) {
                $("<div></div>")
                    .attr("data-hour", hour)
                    .appendTo(slots)
                    .addClass("slot")
                    .click(() => cal.clickSlot(hour, dayIndex))
                    .hover(
                        () => cal.hoverOver(hour),
                        () => cal.hoverOut()
                    );
            }
            $(this).append(header).append(slots);
        });
    }

    calculateCurrentWeek() {
        const now = new Date();
        this.weekStart = addDays(now, -getDayIndex(now));
        this.weekEnd = addDays(this.weekStart, 6);
    }

    changeWeek(number) {
        this.weekOffset += number;
        this.weekStart = addDays(this.weekStart, 7 * number);
        this.weekEnd = addDays(this.weekEnd, 7 * number);
        this.eventsLoaded = false;
        this.showWeek();
        this.loadEvents();
    }

    showWeek() {
        const options = {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
        };
        $("#weekStartDisplay").text(
            this.weekStart.toLocaleDateString(undefined, options)
        );
        $("#weekEndDisplay").text(this.weekEnd.toLocaleDateString(undefined, options));

        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
            const date = addDays(this.weekStart, dayIndex);
            const display = date.toLocaleDateString(undefined, {
                month: "2-digit",
                day: "2-digit",
            });
            $(`.day[data-dayIndex=${dayIndex}] .dayDisplay`).text(display);
        }
        if (this.weekOffset == 0) {
            this.showCurrentDay();
        } else {
            this.hideCurrentDay();
        }
    }

    showCurrentDay() {
        const now = new Date();
        const dayIndex = getDayIndex(now);
        $(`.day[data-dayIndex=${dayIndex}]`).addClass("currentDay");
    }

    hideCurrentDay() {
        $(".day").removeClass("currentDay");
    }

    hoverOver(hour) {
        $(`.time[data-hour=${hour}]`).addClass("currentTime");
    }

    hoverOut() {
        $(".time").removeClass("currentTime");
    }

    clickSlot(hour, dayIndex) {
        if (this.mode != MODE.VIEW) return;
        const now = dateString(new Date());
        this.mode = MODE.CREATE;
        const start = hour.toString().padStart(2, "0") + ":00";
        const end =
            hour < 23
                ? (hour + 1).toString().padStart(2, "0") + ":00"
                : hour.toString().padStart(2, "0") + ":59";

        const date = dateString(addDays(this.weekStart, dayIndex));
        console.log(now);
        console.log(date);
        console.log(now>date);
        if(now > date){
            window.alert("Nicht möglich!");
            this.closeModal();
        }
        else{
        const event = new Event({
            start,
            end,
            date,
            title: "",
            location: "",
            description: "",
            color: "red",
            organizer: "",
            status: "",
            allday: "",
            webpage: "",
        });
        this.openModal(event);
    }
    }

    changeColor() {
        $(".color").removeClass("active");
        $(this).addClass("active");
    }

    openModal(event) {
        $("#modalTitle").text(
            this.mode == MODE.UPDATE ? "Update your event" : "Create a new event"
        );
        $("#eventTitle").val(event.title);
        $("#eventDate").val(event.date);
        $("#eventStart").val(event.start);
        $("#eventEnd").val(event.end);
        $("#eventDescription").val(event.description);
        $("#eventLocation").val(event.location);
        $("#eventOrganizer").val(event.organizer);
        $("#eventStatus").val(event.status);
        $("#eventWebpage").val(event.webpage);

        $(".color").removeClass("active");
        $(`.color[data-color=${event.color}]`).addClass("active");
        if (this.mode == MODE.UPDATE) {
            $("#submitButton").val("Update");
            $("#deleteButton")
                .show()
                .off("click")
                .click(() => event.deleteIn(this));
            $("#copyButton")
                .show()
                .off("click")
                .click(() => event.copyIn(this));
        } else if (this.mode == MODE.CREATE) {
            $("#submitButton").val("Create");
            $("#deleteButton, #copyButton").hide();
        }
        $("#eventModal").fadeIn(200);
        $("#eventTitle").focus();
        $("#calendar").addClass("opaque");
        $("#eventModal")
            .off("submit")
            .submit((e) => {
                e.preventDefault();
                this.submitModal(event);
            });
    }

    submitModal(event) {
        if (event.isValidIn(this)) {
            event.updateIn(this);
            if (this.mode == MODE.UPDATE){
                console.log("update");
                console.log((event.id));
                fetch("http://dhbw.radicalsimplicity.com/calendar/" + iduser + "/events/" + event.id, {
                    method: 'PUT',
                    body: JSON.stringify(event)
                }).then(function (response) {
                    return response.text();
                }).then(function (text) {
                    console.log(text);
                }).catch(function (error) {
                    console.error(error);
                });
                this.closeModal();
                
            }
            else{
            console.log(JSON.stringify(event));
            fetch("http://dhbw.radicalsimplicity.com/calendar/" + iduser + "/events", {
                method: 'post',
                body: JSON.stringify(event)
            }).then(function (response) {
                return response.text();
            }).then(function (text) {
                console.log(text);
            }).catch(function (error) {
                console.error(error);
            });
            this.closeModal();
        }
        }
    }

    closeModal() {
        $("#eventModal").fadeOut(200);
        $("#errors").text("");
        $("#calendar").removeClass("opaque");
        this.mode = MODE.VIEW;
    }

    closeView(){
        $("#listView").fadeOut(200);
        $("#errors").text("");
        $("#calendar").removeClass("opaque");
        $("#list").empty();
        this.mode = MODE.VIEW;
    }

    addNewEvent() {
        if (this.mode != MODE.VIEW) return;
        const now = new Date();
        const dayIndex = getDayIndex(now);
        this.mode = MODE.CREATE;
        const event = new Event({
            start: "12:00",
            end: "13:00",
            date: dayIndex,
            title: "",
            description: "",
            color: "red",
        });
        this.openModal(event);
    }

    saveEvents() {
        localStorage.setItem("events", JSON.stringify(this.events));
    }

    loadEvents() {
        $(".event").remove();
      //  let id = prompt("ID_Number");
       if (!this.eventsLoaded) {
            fetch("http://dhbw.radicalsimplicity.com/calendar/" + iduser + "/events", {
                method: 'GET',
            }).then((response) => {
                return response.text();
            }).then((text) => {
                console.log(text);
                let eventsArray = JSON.parse(text);

                eventsArray.forEach(event => {
                    let date = event["start"].split("T")[0];
                    event["date"] = date;

                    if (this.events[date] == undefined) this.events[date] = {};
                    this.events[date][event.id] = event;
                });

                if (this.events) {
                    for (const date of Object.keys(this.events)) {
                        for (const id of Object.keys(this.events[date])) {
                            const event = new Event(this.events[date][id]);
                            this.events[date][id] = event;
                        }
                    }
                }


                if (this.events) {
                    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
                        const date = dateString(addDays(this.weekStart, dayIndex));
                        if (this.events[date]) {
                            for (const event of Object.values(this.events[date])) {
                                event.showIn(this);
                            }
                        }
                    }
                } else {
                    this.events = {};
                }

            }).catch((error) => {
                console.error(error);
            });
            this.eventsLoaded = true;
            // this.events = JSON.parse(localStorage.getItem("events"));
        }
    
    }

    trash() {
        if (this.mode != MODE.VIEW) return;
        if (this.readyToTrash) {
            this.readyToTrash = false;

            fetch("http://dhbw.radicalsimplicity.com/calendar/" + iduser + "/events", {
                method: 'GET',
            }).then((response) => {
                return response.text();
            }).then((text) => {
                console.log(text);
                let eventsArray = JSON.parse(text);
                for(let i = 0; i< eventsArray.length; i++){
                    let idevent = eventsArray[i].id;
                    fetch("http://dhbw.radicalsimplicity.com/calendar/" + iduser + "/events/" + idevent , {
                    method: 'DELETE',
                    }).catch(function (error) {
                    console.error(error);
                    });
                    this.events = {};
                    this.saveEvents();
                    $(".event").remove();
                }
                window.alert("All Elements deleted!");
            });
        
        } else {
            this.readyToTrash = true;
            window.alert(
                "This will delete all the events in your calendar. " +
                "This cannot be undone. If you are sure, click " +
                "the trash can again in the next minute."
            );
            setTimeout(() => {
                this.readyToTrash = false;
            }, 60 * 1000);
        }
    

    }

   
}
