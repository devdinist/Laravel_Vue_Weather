<template>
    <div class="weather-container">
        <div id="menu_wrap" class="bg-transparent text-black w-128 px-1 py-2">
            <div class="option">
                <div>
                    <form id="search" @submit="searchPlaces" class="flex justify-end items-center px-0.5">
                        <input type="text" id="keyword" size="20" class="w-full px-2 py-1 rounded-lg outline-none" placeholder="장소명 입력">
                        <button type="submit" class="absolute mr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    </form>
                </div>
            </div>
        </div>
        <div id="list" class="absolute w-128 rounded-t-md">
              <ul id="placesList" class="hidden bg-yellow-50 rounded-t-lg min-h-640"></ul>
              <div id="pagination" class="hidden py-2 bg-yellow-50 rounded-b-lg"></div>
            </div>
        <div class="top-wrapper w-128 flex justify-between px-6 py-8  bg-gray-800 rounded-t-lg" v-if="weatherload">
            <div class="temperature-side">
                <div class="live-temperature text-6xl font-bold">{{weatherdata.temp}}°C</div>
                <div class="fells-like-temperature my-2">체감 기온 {{weatherdata.fells_like}}°C</div>
            </div>
            <div class="weather-stat-side flex justify-center flex-col w-1/2">
                <div>{{weatherdata.weather}}</div>
                <div>{{location.name}}</div>
            </div>
            <div class="weather-icon-side flex items-center">
                <img :src="weatherdata.icon ? 'http://openweathermap.org/img/wn/'+weatherdata.icon+'.png' : '' ">
            </div>
        </div>
        <div class="top-wrapper w-128 flex justify-between px-6 py-8  bg-gray-800 rounded-t-lg" v-else>
            <LoadImgs></LoadImgs>
        </div>
        <div class="middle w-128 px-6 py-2 bg-gray-600 rounded-b-lg h-30r" v-if="weatherload">
            <div class="middle-inside flex justify-between items-center px-6 my-2" v-for="(day,idx) in daily_weather_data" :key="day.dt">
                <div class="day">
                  {{new Date(day.dt * 1000).getDate()+" "+days[new Date(day.dt * 1000).getDay()]}}
                </div>
                <div class="icon">
                  <img :src="day.weather[0].icon ? 'http://openweathermap.org/img/wn/'+day.weather[0].icon+'.png' : '' ">
                </div>
                <div>
                  {{new Date(day.sunrise * 1000).getHours() < 10 ? '0' : ''}}{{new Date(day.sunrise * 1000).getHours()+" : "}}
                  {{new Date(day.sunrise * 1000).getMinutes() < 10 ? '0' : ''}}{{new Date(day.sunrise * 1000).getMinutes()}}
                </div>
                <div>
                  {{new Date(day.sunset * 1000).getHours() < 10 ? '0' : ''}}{{new Date(day.sunset * 1000).getHours()+" : "}}
                  {{new Date(day.sunset * 1000).getMinutes() < 10 ? '0' : ''}}{{new Date(day.sunset * 1000).getMinutes()}}
                </div>
                <div class="temperature">
                  <div>
                      {{ Math.round(day.temp.min) }} °C
                  </div>
                  <div>
                      {{ Math.round(day.temp.max) }} °C
                  </div>
                </div>
            </div>
        </div>
        <div class="middle w-128 px-6 py-2 bg-gray-600 rounded-b-lg h-30r flex justify-center items-center" v-else>
          <LoadImgs></LoadImgs>
        </div>
    </div>
</template>
<script>
    import axios from 'axios';
    import LoadImgs from './LoadImg.vue';
    export default {
        components:{
            LoadImgs
        },
        mounted() {
            this.getdata();
            if (window.kakao && window.kakao.maps) {
                this.initkakaomap();
            } else {
                const script = document.createElement("script");
                /* global kakao */
                script.onload = () => kakao.maps.load(this.initkakaomap);
                script.src =
                    "//dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey="+process.env.MIX_KAKAO_JS_KEY+"&libraries=services";
                document.head.appendChild(script);
            }
        },
        data() {
            return{
                weatherload : false,
                days : ["일","월","화","수","목","금","토"],
                location : {
                    lat : 37.566665,
                    lng : 126.978427,
                    name : "서울 종로구",
                },
                weatherdata : {
                    temp:'',
                    fells_like:'',
                    weather:'',
                    icon :'',
                },
                daily_weather_data : [],
                ps : null,
            }
        },
        methods: {
          // 날씨 정보를 요청하는 메소드입니다. Axios 라이브러리를 사용합니다.
          getdata(){
            axios.get('/api/weather',{
              params : this.location
            })
            .then(res => {
                this.weatherdata.temp = Math.round(res.data.current.temp);
                this.weatherdata.fells_like = Math.round(res.data.current.feels_like);
                this.weatherdata.weather = res.data.current.weather[0].description;
                this.weatherdata.icon = res.data.current.weather[0].icon;
                this.daily_weather_data = res.data.daily;
                this.weatherload = true;
            });
          },

          initkakaomap(){
              this.ps = new kakao.maps.services.Places();  // 장소 검색 객체를 생성합니다
              this.searchPlaces();
          },

          searchPlaces(e) {      // 키워드 검색을 요청하는 함수입니다
            if(e !== undefined) e.preventDefault();
            var keyword = document.getElementById('keyword').value;
            if (!keyword.replace(/^\s+|\s+$/g, '')) {
                return false;
            }
            // 장소검색 객체를 통해 키워드로 장소검색을 요청합니다
            // size : 9는 한페이지에 최대 9개의 결과를 출력한다는 의미입니다.
            this.ps.keywordSearch( keyword, this.placesSearchCB,{size : 9});
          },

          placesSearchCB(data, status, pagination) {    // 장소검색이 완료됐을 때 호출되는 콜백함수 입니다
            if (status === kakao.maps.services.Status.OK) {
                let placesList_ele = document.getElementById("placesList");
                let pagination_ele = document.getElementById("pagination");

                placesList_ele.classList.remove("hidden");
                pagination_ele.classList.remove("hidden");

                // 정상적으로 검색이 완료됐으면
                // 검색 목록과 마커를 표출합니다
                this.displayPlaces(data);

                // 페이지 번호를 표출합니다
                this.displayPagination(pagination);

                const form = document.getElementById("search");
                const list = document.getElementById("list");
                let btn = undefined;
                if(document.getElementById("toggle_list")){
                  btn = document.getElementById("toggle_list");
                  form.removeChild(btn);
                }
                btn = this.makebtn();

                if(!document.getElementById("toggle_list")){
                  form.appendChild(btn);
                }

                if(list.classList.contains("hidden")){
                  list.classList.remove("hidden");
                }
            } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
                alert('검색 결과가 존재하지 않습니다.');
                return;
            } else if (status === kakao.maps.services.Status.ERROR) {
                alert('검색 결과 중 오류가 발생했습니다.');
                return;
            }
          },
          // 검색결과 목록창을 토글할 버튼을 만드는 함수
          makebtn(){
            const btn = document.createElement("button");
            btn.setAttribute("type","button");
            btn.setAttribute("id","toggle_list");

            btn.className = "absolute mr-10";
            btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">'+
                  '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />'+
                '</svg>';
            btn.addEventListener("click",function(){
              if(list.classList.contains("hidden")){
                list.classList.remove("hidden");
                btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">'+
                  '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />'+
                '</svg>';
              }else{
                list.classList.add("hidden");
                btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">'+
                            '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />'+
                            '</svg>';
              }
            });
            return btn;
          },

          displayPlaces(places) {

            var listEl = document.getElementById('placesList'),
            menuEl = document.getElementById('menu_wrap'),
            fragment = document.createDocumentFragment();

            // 검색 결과 목록에 추가된 항목들을 제거합니다
            this.removeAllChildNods(listEl);

            for ( var i=0; i<places.length; i++ ) {

                var itemEl = this.getListItem(i, places[i]); // 검색 결과 항목 Element를 생성합니다

                // 검색목록 클릭시 이벤트 대응을 위한 함수
                this.search_list_callback(itemEl,places[i].y,places[i].x,places[i].address_name);

                fragment.appendChild(itemEl);
            }

            // 검색결과 항목들을 검색결과 목록 Element에 추가합니다
            listEl.appendChild(fragment);
            menuEl.scrollTop = 0;
          },
          // 각 목록별 지정할 콜백함수
          search_list_callback(itemEl,lat,lng,place_addr){
              var vue_this = this;

              itemEl.onclick = function(){
                  vue_this.weatherload = false;
                  vue_this.location.lat = lat;
                  vue_this.location.lng = lng;
                  vue_this.location.name = place_addr;
                  vue_this.getdata();

                  const list = document.getElementById("list");

                  // 검색 결과 목록에 추가된 항목들을 제거합니다
                  list.classList.add("hidden");

                  const btn = document.getElementById("toggle_list");
                  btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">'+
                                    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />'+
                                    '</svg>';
              }
          },
          // 리스트 목록 생성 함수
          // li 태그 사용
          getListItem(index, places) {

              var el = document.createElement('li'),
              itemStr = '' +
              '<div><span class="markerbg marker_' + (index+1) + ' mt-3 ml-2 "></span></div>' +
                          '<div class="info pl-12 py-2 pr-3">' +
                          '<input type="hidden" name="lat_'+(index+1)+'" value="'+places.y+'" >' +
                          '<input type="hidden" name="lng_'+(index+1)+'" value="'+places.x+'" >' +
                          '   <h5 class="text-black">' + places.place_name + '</h5>';

              if (places.road_address_name) {
                  itemStr += '    <span class="inline-block text-black">' + places.road_address_name + '</span>' +
                              '   <span class="jibun gray">' +  places.address_name  + '</span>';
              } else {
                  itemStr += '    <span class="text-black">' +  places.address_name  + '</span>';
              }

              el.innerHTML = itemStr;
              el.className = 'item';
              el.classList.add("min-h-70");
              return el;
          },
          // 페이지네이션 함수
          displayPagination(pagination) {
              var paginationEl = document.getElementById('pagination'),
                  fragment = document.createDocumentFragment(),
                  i;

              // 기존에 추가된 페이지번호를 삭제합니다
              while (paginationEl.hasChildNodes()) {
                  paginationEl.removeChild (paginationEl.lastChild);
              }

              for (i=1; i<=pagination.last; i++) {
                  var el = document.createElement('a');
                  el.href = "#";
                  el.innerHTML = i;

                  el.className = 'text-black';
                  if (i===pagination.current) {
                      el.className = 'on';
                  } else {
                      el.onclick = (function(i) {
                          return function() {
                              pagination.gotoPage(i);
                          }
                      })(i);
                  }

                  fragment.appendChild(el);
              }
              paginationEl.appendChild(fragment);
          },
          removeAllChildNods(el) {
              while (el.hasChildNodes()) {
                  el.removeChild (el.lastChild);
              }
          },
        },
    }

</script>

<style>
        .map_wrap, .map_wrap * {margin:0;padding:0;font-family:'Malgun Gothic',dotum,'돋움',sans-serif;font-size:12px;}
.map_wrap a, .map_wrap a:hover, .map_wrap a:active{color:#000;text-decoration: none;}
.map_wrap {position:relative;width:100%;height:500px;}
.bg_white {background:#fff;}
#menu_wrap hr {height: 1px;border: 0; border-top: 2px solid #5F5F5F;margin:3px 0;}
#menu_wrap .option{text-align: center;}
#menu_wrap .option p {margin:10px 0;}
#menu_wrap .option button {margin-left:5px;}
#placesList li {list-style: none;}
#placesList .item {position:relative;border-bottom:1px solid #888;overflow: hidden;cursor: pointer;min-height: 65px;}
#placesList .item span {margin-top:4px;}
#placesList .item h5, #placesList .item .info {text-overflow: ellipsis;overflow: hidden;white-space: nowrap;}
#placesList .info .gray {color:#8a8a8a;}
#placesList .info .jibun {padding-left:26px;background:url(https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/places_jibun.png) no-repeat;}
#placesList .info .tel {color:#009900;}
#placesList .item .markerbg {float:left;position:absolute;width:36px; height:37px;background:url(https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png) no-repeat;}
#placesList .item .marker_1 {background-position: 0 -10px;}
#placesList .item .marker_2 {background-position: 0 -56px;}
#placesList .item .marker_3 {background-position: 0 -102px}
#placesList .item .marker_4 {background-position: 0 -148px;}
#placesList .item .marker_5 {background-position: 0 -194px;}
#placesList .item .marker_6 {background-position: 0 -240px;}
#placesList .item .marker_7 {background-position: 0 -286px;}
#placesList .item .marker_8 {background-position: 0 -332px;}
#placesList .item .marker_9 {background-position: 0 -378px;}
#placesList .item .marker_10 {background-position: 0 -423px;}
#placesList .item .marker_11 {background-position: 0 -470px;}
#placesList .item .marker_12 {background-position: 0 -516px;}
#placesList .item .marker_13 {background-position: 0 -562px;}
#placesList .item .marker_14 {background-position: 0 -608px;}
#placesList .item .marker_15 {background-position: 0 -654px;}
#pagination {text-align: center;}
#pagination a {display:inline-block;margin-right:10px;}
#pagination .on {font-weight: bold; cursor: default;color:red;}
    </style>
