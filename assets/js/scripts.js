const countryName = document.getElementById('location-text');
const dateInput = document.getElementById('date-input');
const calendarImg = document.getElementById('calendar-img');
const regionNamesAr = new Intl.DisplayNames(['ar'], { type: 'region' }); // convert the country name from ENG to AR based on its code
const dataList = document.getElementById('cities');
const currentLocation = document.getElementById('current-location');
const city = document.getElementById('country-name')
const regionName = document.getElementById('location-prayer-time');
const searchBtn = document.getElementById('magnifying-glass');
const today =  new Date();
const countryAPIKey = '56ebb7edbcmshd9cbf557e842fe6p1c506ejsn305a7803d0c0'
const countryAPIHost = 'wft-geo-db.p.rapidapi.com'
const daraga = document.getElementById('daraga');
const hijriMiladaaDateDiv = document.getElementById('hijri-miladaa-date');
const miladaaDateP = document.getElementById('miladaa-date');
const hijriDateP = document.getElementById('hijri-date');
const prayerTimesDiv = document.getElementById('prayer-times');
const calendarDate = document.getElementById('calendar-date');
const locationBtn = document.getElementById('location-crosshairs');
const prayTimeEnToAr = [
    {'Fajr' : "الفجر"},
    {'Sunrise' : "الشروق"},
    {'Dhuhr' : "الظهر"},
    {'Asr' : "العصر"},
    {'Maghrib' : "المغرب"},
    {'Isha' : "العشاء"}
]

let debouncingTime ; // to prevent the bulk requests

document.addEventListener('DOMContentLoaded' , ()=>{
    getLocation(); //get the current location of the use once the documents is loaded
});

locationBtn.addEventListener('click' , ()=>{
    getLocation();  
});

searchBtn.addEventListener('click' , ()=>{
    if(dataList.innerText.trim()){ // if there is a selected option
        console.log(dataList.innerText)
        getPrayTimeByAddress(countryName.value)
        .then(response => {
        {
            getNextPrayTime(dataList.innerText , `${today.getDate()}-${today.getMonth()+1}-${today.getFullYear()}`)
            .then((nextPrayResponse) =>{
                const nextPrayTime = Object.keys(nextPrayResponse.data.data.timings)[0];
                fillElements(response, dataList.innerText , nextPrayTime);
            })
            .catch((error)=>{
                console.error(error);
            })
            
            // console.log(response.data.data.meta.timezone.split('/')[1])
            // const region = response.data.data.meta.timezone.split('/')[1]
            // let countryCode;
            // getCountryName(region,countryAPIKey,countryAPIHost)
            // .then((response)=>{
            //     console.log(response.data.data)
            // })
            // regionName.innerText = regionNamesAr.of(countryCode);
        }
        })
        .catch(error => {
            console.error(error);
        });
    }
    
});

calendarImg.addEventListener('click', function() {
    dateInput.showPicker();
});

dateInput.addEventListener('change', function() {
    // first get the selected date and check the type
    let selectedDate = new Date(this.value);
    let location = countryName.value? countryName.value : sessionStorage.getItem('currentLocation');
    selectedDate = `${selectedDate.getDate()}-${selectedDate.getMonth()+1}-${selectedDate.getFullYear()}`
    
    // next get current address location either from the datalist.value or if its empty get the user location
    getPrayTimeByAddress(location , selectedDate)
    .then((response)=>{
        const countryCode = dataList.innerText !=''? dataList.innerText : sessionStorage.getItem('countryCode');
        getNextPrayTime(location , selectedDate)
        .then((nextPrayResponse) =>{
            const nextPrayTime = Object.keys(nextPrayResponse.data.data.timings)[0];
            fillElements(response , countryCode , nextPrayTime)
        })
    });
});

countryName.addEventListener('input',function(){
    const q = this.value.trim();
    dataList.innerHTML = '' // clear the datalist first 
    if (q){ // if there is a value in the input field 
        clearTimeout(debouncingTime); // clear the debounceTime
        debouncingTime = setTimeout(()=>{
            getCountryName(this.value , countryAPIKey , countryAPIHost) // get country name and code 
            .then(response => {
                for (data of response.data.data)
                {
                    const option = document.createElement('option');
                    option.innerText = data.code;
                    option.setAttribute('value' , data.name)
                    dataList.append(option);
                }
            })
            .catch(error => {
                console.error(error);
            });
        },100)
    }
});