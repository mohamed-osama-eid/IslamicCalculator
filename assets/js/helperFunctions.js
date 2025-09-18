function getCountryName(namePrefix , key , host){
    /*              DOCUMENTATION
        This function is used to return(get) the country name based on prefix(the first letters of a word)
                    PARAMS
        limit --------> How many result will be retrieved from the API.
        namePrefix --------> Letters to search.
    */
    return  axios.get("https://wft-geo-db.p.rapidapi.com/v1/geo/countries", { // get country names based on chars entered to the input field
                params: {
                    limit: 5,
                    namePrefix: namePrefix
                },
                headers: {
                    'x-rapidapi-key': key,
                    'x-rapidapi-host': host
                }
            });
}

function getCountryNameByLangLat(longitude , latitude , key , host){
    /*              DOCUMENTATION
        This function is used to return(get) the country name based on longitude and latitude.
                    PARAMS
        limit --------> How many result will be retrieved from the API.
        location --------> The location (Latitude/longitude) in ISO-6709 format: ±DD.DDDD±DDD.DDDD
    */
    return  axios.get("https://wft-geo-db.p.rapidapi.com/v1/geo/cities", { // get country names based on chars entered to the input field
                params: {
                    limit: 1,
                    location: `${ latitude > 0 ? '+' + latitude : latitude }${ longitude > 0 ? '+' + longitude : longitude }`
                },
                headers: {
                    'x-rapidapi-key': key,
                    'x-rapidapi-host': host
                }
            });
}

function createPrayDivElements(prayName , prayTime , isNextPray){
    /*              DOCUMENTATION
        This function is used to create the essential elements for pray div
                    PARAMS
        prayName --------> The pray name in AR.
        prayTime --------> The time of pray (EX. HH:MM).
    */
    const prayDiv = document.createElement('div');
    const prayNameP = document.createElement('p');
    const prayTimeP = document.createElement('p');
    const nextPray = document.createElement('p');

    prayDiv.classList.add('pray');
    if (isNextPray){
        nextPray.innerText = 'الصلاة التالية';
        nextPray.classList.add('green')
        prayDiv.classList.add('next-pray');
        prayDiv.append(nextPray);
    }
        

    prayNameP.classList.add('pray-name');
    prayTimeP.classList.add('pray-time');

    prayNameP.innerText = prayName;
    prayTimeP.innerText = getAmPm(prayTime)

    prayDiv.append(prayNameP , prayTimeP);
    prayerTimesDiv.append(prayDiv);
}

function getPrayTimeByAddress(address , date){
    /*              DOCUMENTATION
        This function is used to return(get) the pray time through address , data , and method .
                    PARAMS
        data --------> The date of the Pray in DD-MM-YYYY.
        method --------> Used to calculate the time.
        address --------> country name in EN.
    */
    return axios.get(`https://api.aladhan.com/v1/timingsByAddress/${date}`, { 
            params: {
                method: 3,
                address: address
            },
        })
}

function getNextPrayTime(address , date){
    /*              DOCUMENTATION
        This function is used to return(get) the next pray time through address , data , and method .
                    PARAMS
        data --------> The date of the Pray in DD-MM-YYYY.
        method --------> Used to calculate the time.
        address --------> country name in EN.
    */
    return axios.get(`https://api.aladhan.com/v1/nextPrayerByAddress/${date}`, { 
            params: {
                method: 3,
                address: address
            },
        })
}

function getLocation() {
    /*              DOCUMENTATION
        This function is used to return(get) the location of the user.
    */
    if (navigator.geolocation) {
        return navigator.geolocation.getCurrentPosition(showPosition, showError); // getCurrentPosition in latitude and longitude
    } else {
        console.error("Geolocation is not supported by this browser.");
    }
}

function showPosition(position) {
    /*              DOCUMENTATION
        This is a callbackFunction that is used to return(get) the latitude and longitude.
    */
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
    // get country name after getting the latitude and longitude.
    getCountryNameByLangLat(longitude , latitude , countryAPIKey , countryAPIHost)
    .then((countryResponse)=>{
        getPrayTimeByAddress(countryResponse.data.data[0].country , `${today.getDate()}-${today.getMonth()+1}-${today.getFullYear()}`) // countryResponse.data.data[0].country => country name
        .then((prayTimingsResponse)=>{
            sessionStorage.setItem('currentLocation' , countryResponse.data.data[0].country );
            sessionStorage.setItem('countryCode' , countryResponse.data.data[0].countryCode );
            getNextPrayTime(countryResponse.data.data[0].country , `${today.getDate()}-${today.getMonth()+1}-${today.getFullYear()}`)
            .then((nextPrayResponse) =>{
                const countryCode = countryResponse.data.data[0].countryCode;
                const nextPrayTime = Object.keys(nextPrayResponse.data.data.timings)[0];
                fillElements(prayTimingsResponse , countryCode , nextPrayTime);
            });
            
        });

    });
}

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            console.log("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            console.log("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            console.log("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            console.log("An unknown error occurred.");
            break;
    }
}

function fillElements(response , countryCode , nextPrayTime){
    prayerTimesDiv.innerText = '';
    daraga.innerText = `الفجر ${response.data.data.meta.method.params.Fajr} درجة , العشاء ${response.data.data.meta.method.params.Isha} درجة`
    city.innerText = regionNamesAr.of(countryCode);

    miladaaDateP.innerText = `${response.data.data.date.gregorian.day} ${response.data.data.date.hijri.weekday.ar} ${response.data.data.date.gregorian.year}`
    hijriDateP.innerText = `${response.data.data.date.hijri.day} ${response.data.data.date.hijri.month.ar} ${response.data.data.date.hijri.year}`
    
    const {Fajr,Sunrise,Dhuhr,Asr,Maghrib,Isha} = response.data.data.timings
    const APITimings = [Fajr,Sunrise,Dhuhr,Asr,Maghrib,Isha]

    for (let i = APITimings.length-1 ; i>= 0 ; i-- ){
        const prayTimeEnToArObjValue = Object.values(prayTimeEnToAr[i])[0];
        const indexNextPray = prayTimeEnToAr.findIndex(obj => obj.hasOwnProperty(nextPrayTime));

        if (prayTimeEnToArObjValue == Object.values(prayTimeEnToAr[indexNextPray])[0]){
            createPrayDivElements( prayTimeEnToArObjValue , APITimings[i] , true);
        }else{
            createPrayDivElements( prayTimeEnToArObjValue , APITimings[i]) , false;
        }
    }
        
    [currentLocation, hijriMiladaaDateDiv, prayerTimesDiv, calendarDate]
        .forEach(el => el.style.opacity = 1);
}

function getAmPm(timeStr) {
    const [hourStr, minuteStr] = timeStr.split(":");
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    const period = hour >= 12 ? "PM" : "AM";

    if (hour === 0) {
        hour = 12; // midnight
    } else if (hour > 12) {
        hour = hour - 12;
    }

    return `${hour}:${minute.toString().padStart(2, "0")} ${period}`;
}