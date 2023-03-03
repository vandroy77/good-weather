

const weather = {
  apiKey: "07b02c6f2e9298d72a590e1b73c602ab",
  unsplashAPIKey: "q1PIGOFYYIXTSByD2EFfjOSv7SEumjXJmIkbqnd3FAk",

  Current_lat: 0,
  Current_long: 0,
  alldata:{},
  currentLanguage: 'portuguese',

  fetchWeather: async function (city, lat, long) {

    var lang = this.currentLanguage == 'portuguese' ? 'pt_br' : 'eng'
    if (!!city) {
      await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=${lang}&appid=${this.apiKey}`
      )
        .then((response) => response.json())
        .then((data) => {
          this.handleData(data);
        });
    } else if (!!lat && !!long) {
      await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&units=metric&lang=${lang}&appid=${this.apiKey}`
      )
        .then((response) => response.json())
        .then((data) => {
          this.handleData(data);
        });
    }
  },
  getImageBackground: async function (location) {
    let getImage = await this.getNewImage(location);
    document.querySelector(".background-img").src = getImage;
    //re run animatiion
    document.querySelector(".background-img").classList.remove("change");
    document.querySelector(".background-img").offsetWidth;
    document.querySelector(".background-img").classList.add("change");
  },
  getNewImage: async function (locationName) {
    return fetch(
      `https://api.unsplash.com/search/photos?query=${locationName}&orientation=landscape&client_id=${weather.unsplashAPIKey}`
    )
      .then((response) => response.json())
      .then((data) => {
        randomN = Math.floor(Math.random() * data.results.length);
        return data.results[randomN].urls.regular;
      });
  },

  // when permissions are denied or some error ocurr
  showError: function (error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        console.log("permission denied");
        document.getElementById("location-icon").className =
          "fa-solid fa-triangle-exclamation";
        break;
      case error.POSITION_UNAVAIABLE:
        alert("Location information is unavailable.");
        break;

      case error.TIMEOUT:
        alert("The request to get the location  timed out.");
        break;
      default:
        alert("Unknown Error.", error.code);
    }
  },

  handleData: function (data) {
    if (data.cod === "404") {
      document.querySelector(".weather").style.display = "none";
      document.querySelector(".not-found").style.display = "block";
      document.querySelector(".not-found").classList.add("fade-in");
      return;
      
    } else
    this.alldata = data
    document.querySelector(".weather").style.display = "block";
    document.querySelector(".not-found").style.display = "none";
    this.displayWeather(data);
  },

  language: {
    english: {
      city: "Weather in ",
      humidity: "Humidity: ",
      description: "Description: ",
      wind: "Windspeed: ",
      author:"Developer: ",
      github:"Check out my Github."
    },
    portuguese: {
      city: "Tempo em ",
      humidity: "Umidade: ",
      description: "Descrição: ",
      wind: "Velocidade do Vento: ",
      author: "Desenvolvedor: ",
      github: "Veja meu Github."

    }
  },
  provideInformationFromData:function(data){
    //values
    const { name } = data;
    const {description} = data.weather[0]
    const { temp, humidity } = data.main;
    const { speed } = data.wind;

    // tags
    const allinfo = document.querySelectorAll('.info') 
    allinfo.forEach(itens => {
        itens.innerHTML = `${this.language[this.currentLanguage][itens.classList[0]]}`
    })
     document.querySelector(".city").innerHTML= document.querySelector(".city").innerHTML + `${name}`;
     document.querySelector(".wind").innerHTML = document.querySelector(".wind").innerHTML + `${speed}km/h`;
     document.querySelector(".temp").innerHTML = `${Math.floor(temp)}ºC`;
     document.querySelector(".description").innerHTML =document.querySelector(".description").innerHTML + `${description}`;
     document.querySelector(".humidity").innerHTML = document.querySelector(".humidity").innerHTML + `${humidity}%`;
     document.querySelector(".author").innerHTML = this.language[this.currentLanguage]['author'] + 'Iago Pereira'
     document.querySelector(".github").innerHTML = this.language[this.currentLanguage]['github']
  },

  displayWeather: function (data) {

    const { name } = data;
    const { icon } = data.weather[0];

    this.provideInformationFromData(this.alldata)
    //
    document.querySelector(
      ".icons"
    ).src = `http://openweathermap.org/img/wn/${icon}@2x.png`;
    document.querySelector(".weather").classList.remove("loading");
    // rerun animation
    document.querySelector(".weather").classList.remove("blur");
    document.querySelector(".weather").offsetWidth;
    document.querySelector(".weather").classList.add("blur");

    //"url('  )"
    //`https://api.unsplash.com/photos?query=${name}&client_id=${weather.unsplashAPIKey}`

    weather.getImageBackground(name);
  },

  //pass the value written on the search bar and call the function fetchweather to verify if the city exist
  search: function () {
    this.fetchWeather(document.querySelector(".search-bar").value);
  },
};

// listeners when u press Enter or click on the button.
document
  .querySelector('.search-button')
  .addEventListener("click", function () {
    weather.search();
  });

document.querySelector(".search-bar").addEventListener("keyup", function (e) {
  if (e.key === "Enter") weather.search();
});

// listeners for languages buttons
document.querySelectorAll(".translate-container button").forEach(button => {
    button.addEventListener('click',()=>{
        document.querySelector(".translate-container .active").classList.remove('active')
        button.classList.add('active')
        weather.currentLanguage = button.getAttribute('language')
        weather.provideInformationFromData(weather.alldata)      
    })
});

// get permission when hit the location button
document.querySelector(".location-button").addEventListener("click", function () {
    if (!!this.Current_lat && !!this.Current_long) {
      return weather.fetchWeather(false, this.Current_lat, this.Current_long);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.Current_lat = position.coords.latitude;
        this.Current_long = position.coords.longitude;
        document.getElementById("location-icon").className =
          "fa-sharp fa-solid fa-location-dot";
        document.querySelector(".location-button").style.background = "green";
        return weather.fetchWeather(false, this.Current_lat, this.Current_long);
      }, weather.showError);
    }
  });

// default search
weather.fetchWeather("São Vicente");

// test
//https://api.openweathermap.org/data/2.5/weather?q=santos&units=metric&lang=pt_br&appid=07b02c6f2e9298d72a590e1b73c602ab
//https://api.openweathermap.org/data/2.5/weather?lat=-23.9631&lon=-46.3919&lang=pt_br&appid=07b02c6f2e9298d72a590e1b73c602ab
