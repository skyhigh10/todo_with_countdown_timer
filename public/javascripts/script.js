let simple_timer = document.getElementById("simple_timer");

if (simple_timer) {
  for (let i = 1; i < 60; i++) {
    i < 10 ? $("#reminder_minute").append(`<option value="0${i}">0${i}</option>`) : $("#reminder_minute").append(`<option value="0${i}">${i}</option>`);
  }

  document.getElementById("set_reminder").addEventListener("click", async () => {
      let reminder_id = document.getElementById("reminder_id").value.trim();
      let reminder_topic = document
        .getElementById("reminder_topic")
        .value.trim();
      let reminder_content = document
        .getElementById("reminder_content")
        .value.trim();

      let reminder_hour = $("#reminder_hour").val();
      let reminder_minute = $("#reminder_minute").val();
      let reminder_meridian = $("#reminder_meridian").val();

      let email = document.getElementById("email").value.trim();

      let errors = [];

      if (reminder_id.length == 0) {
        errors.push("Please input a Reminder Id number");
      }
      if (reminder_topic.length == 0) {
        errors.push("Please input a Reminder Topic");
      }
      if (reminder_content.length == 0) {
        errors.push("Please input a Reminder Content");
      }

      console.log(
        reminder_id,
        reminder_topic,
        reminder_content,
        reminder_hour,
        reminder_minute,
        reminder_meridian,
        errors
      );

      if (errors.length == 0) {

        if (reminder_hour != 12 && reminder_meridian == 'PM') {
          reminder_hour = Number(reminder_hour) + 12;

        };
        if (reminder_hour == 12 && reminder_meridian == 'AM') {
          reminder_hour = Number(reminder_hour) + 12;

        }



        let alarm_time = new Date();
        alarm_time.setHours(reminder_hour, reminder_minute, 0)
        alarm_time = alarm_time.toLocaleTimeString('en-GB');
        alarm_time = alarm_time.slice(0, -3)
        let time_of_setting = new Date().toLocaleTimeString('en-GB');
        time_of_setting = time_of_setting.slice(0, -3);

        console.log(alarm_time)

        let reminder_object = {
          reminder_id: reminder_id,
          reminder_topic: reminder_topic,
          reminder_content: reminder_content,
          reminder_hour: reminder_hour,
          reminder_minute: reminder_minute,
          reminder_meridian: reminder_meridian,
          email: email,
          alarm_time: alarm_time,
          time_of_setting: time_of_setting
        };




        // console.log(x )
        // console.log(a)
        // console.log(b)
        // console.log(y)
        // console.log(z)

        try {
          const feedback = await axios.post(
            "/reminder_details",
            reminder_object
          );
          console.log(feedback);

          let message = feedback.data.message;
          let is_new_user = feedback.data.new_User;


          alert(message)






        } catch (error) {
          console.log(error);
        }
      }
    });
}

//Countdown functionality by chiemelie

class Timer {
  constructor(root) {
    root.innerHTML = Timer.getHTML();

    this.el = {
      minutes: root.querySelector(".timer__part--minutes"),
      seconds: root.querySelector(".timer__part--seconds"),
      control: root.querySelector(".timer__btn--control"),
      reset: root.querySelector(".timer__btn--reset")
    };

    this.interval = null;
    this.remainingSeconds = 0;

    this.el.control.addEventListener("click", () => {
      if (this.interval === null) {
        this.start();
      } else {
        this.stop();
      }
    });

    this.el.reset.addEventListener("click", () => {
      const inputMinutes = prompt("Enter number of minutes you want to set the counter:");

      if (inputMinutes < 60) {
        this.stop();
        this.remainingSeconds = inputMinutes * 60;
        this.updateInterfaceTime();
      }
    });
  }

  updateInterfaceTime() {
    const minutes = Math.floor(this.remainingSeconds / 60);
    const seconds = this.remainingSeconds % 60;

    this.el.minutes.textContent = minutes.toString().padStart(2, "0");
    this.el.seconds.textContent = seconds.toString().padStart(2, "0");
  }

  updateInterfaceControls() {
    if (this.interval === null) {
      this.el.control.innerHTML = `<span class="material-icons">start</span>`;
      this.el.control.classList.add("timer__btn--start");
      this.el.control.classList.remove("timer__btn--stop");
    } else {
      this.el.control.innerHTML = `<span class="material-icons">pause</span>`;
      this.el.control.classList.add("timer__btn--stop");
      this.el.control.classList.remove("timer__btn--start");
    }
  }

  start() {
    if (this.remainingSeconds === 0) return;

    this.interval = setInterval(() => {
      this.remainingSeconds--;
      this.updateInterfaceTime();

      if (this.remainingSeconds === 0) {
        this.stop();
      }
    }, 1000);

    this.updateInterfaceControls();
  }

  stop() {
    clearInterval(this.interval);

    this.interval = null;

    this.updateInterfaceControls();
  }

  static getHTML() {
    return `
              <span class="timer__part timer__part--minutes">00</span>
              <span class="timer__part">:</span>
              <span class="timer__part timer__part--seconds">00</span>
              <button type="button" class="timer__btn timer__btn--control timer__btn--start">
                  <span class="material-icons">Start</span>
              </button>
              <button type="button" class="timer__btn timer__btn--reset">
                  <span class="material-icons">Create</span>
              </button>
          `;
  }
}

new Timer(
  document.querySelector(".timer")
);


