$( document ).ready(function(){
	fn_callOLMap();
	fn_initUIEvent();
})
//전역 변수 선언
var GLOBAL = {
	VWORLD_API_KEY : '767AD70A-1970-376D-A8EF-03B944C5B6A4'//#실습 브이월드 API 키 입력 필요 //localhost기준으로 발급 필요
	,VWORLD_API_DOMAIN:"localhost"
	,VWORLD_WMS_URL : 'https://api.vworld.kr/req/wms'
	,GEOSERVER_WMS_URL : 'http://localhost:8088/geoserver/lxsp/wms'
};

function fn_initUIEvent(){
	
	/**검색 입력칸 엔터이벤트 */
	$('#searchKeyword_vw').on('keypress', function(e){
		if(e.keyCode == 13){
			$('#search_btn_vw').click();
			$('#searchKeyword_vw').blur();
		}
	});
		/**검색 입력칸 엔터이벤트 */
	$('#searchKeyword_db').on('keypress', function(e){
		if(e.keyCode == 13){
			$('#search_btn_db').click();
			$('#searchKeyword_db').blur();
		}
	});

	//위치 검색 페이지 이동	(동적요소에 .click()이 적용 안되는 오류가 있음)
	$(document).on('click', '.s_paging li',function(e){
		let num = this.innerText;

		if($(this).attr('disabled') == 'disabled'){
			return;
		}

		if(num == '▶'){
			num = Number($('#currnetPage').text())+1;
		}else if(num == '◀'){
			num = Number($('#currnetPage').text())-1;
		}
	
		fn_searchVworld(num);
	});
	
	//메뉴 클릭시 지도 표시 내용 초기화
	$('#right_tab_btn li').click(function(e){
		if(this.innerText != '지도'){
		}
		if(this.innerText != '검색'){
		}
		if(this.innerText != '인터렉션'){
		}
		if(this.innerText != '레이어관리'){		
		}

	})
	
}
//지도 전역변수
var OL_MAP = "";
// ##실습 1. 기본지도 호출 함수 
function fn_callOLMap(){   
	OL_MAP = new ol.Map({
		target: 'mapcontainer',
		layers:[
			new ol.layer.Tile({
					source: new ol.source.OSM()
				})
			],
		view: new ol.View({
			projection: 'EPSG:4326',
			center: [127, 36],
			zoom: 6
			})
	});
}

//##실습 2. 카메라 이동합수
function fn_moveCamera(){
	//1. html에 입력된 값 획득
    var lon = $('#camLon').val(); //경도
    var lat = $('#camLat').val(); //위도
 
	//2. Number로 형변환
	lon = parseFloat(lon); 
	lat = parseFloat(lat); 

	//3. 오픈레이어스 카메라 이동 합수 구현
	let ol_camera = OL_MAP.getView();
	ol_camera.setCenter([lon, lat]);
	ol_camera.setZoom(15);
	
}

//##실습 3. 클릭지점 좌표 이벤트 함수
function fn_evtRegister(flag){
	if(flag){
		//이벤트 등록 체크박스 체크시 이벤트 등록
		OL_MAP.on('singleclick', fn_clickForCoord);
	}else{		
		//이벤트 해제 체크박스 해제시 이벤트 해제
		OL_MAP.un('singleclick', fn_clickForCoord);
	}
}

//클릭 이벤트 핸들러
function fn_clickForCoord(_evt){
 
  // 이벤트 객체에서 좌표 취득
  // 기본설정 좌표계로 반환됨
  const coordinate = _evt.coordinate;

  // 로그 출력 (EPSG:3857 좌표계)
  console.log('클릭한 좌표 (EPSG:4326):', coordinate);
  // 취득한 좌표값 화면에 입력	
  $('#evntLon').val(coordinate[0]);
  $('#evntLat').val(coordinate[1]);
  
  fn_moveCamera();
  
  //지오코딩 함수 호출
  fn_geocodeVworld();
}


/**
 * ##실습 4. vworld api를 이용한 지오코딩 함수 
 *  1) 클릭이벤트로 취득한 좌표로 리버스 지오코딩 요청(좌표->주소)
 *  2) 반환받은 결과 파싱해서 html로 주소 표현
 * */
//vworld 위치 검색 api
function fn_geocodeVworld(){
	
	$.ajax({
		method: 'GET',
		dataType: 'jsonp',
		data: {
			service: 'address',
			request: 'GetAddress', //'GetCoord',
			version: '2.0',
			crs: 'EPSG:4326',
			type: 'BOTH',
			//address: '서울특별시 강남구 봉은사로 524',
			format: 'json',
			errorformat: 'json',
			point: $('#eventLon').val() + "," + $('#eventLat').val(),
			key: GLOBAL.VWORLD_API_KEY
		},
		success: function(result){
			console.log(result);
		}
	});
	
}

//################################################################################ 검색
/**
 * ##실습 5. 자체구축 db에서 검색하기
 *  1) 키워드 위치 검색
 *  2) 검색 목록 별 POINT 생성
 *  3) 페이징 적용
 *  4) 검색 목록 클릭시 해당 위치로 이동
 * */

//벡터 소스 추가
const SEARCHPOI_STYLE = new ol.style.Style({
    image: new ol.style.Icon({
        anchor: [0.5, 46],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        src: 'https://openlayers.org/en/latest/examples/data/icon.png',
    })
});

const SEARCHPOI_SOURCE = new ol.source.Vector({
	
});	
//레이어에 벡터소스 추가
const SEARCHPOI_LAYER = new ol.layer.Vector({
	name : 'SEARCHPOI_LAYER',
	source: SEARCHPOI_SOURCE,
	style:SEARCHPOI_STYLE	
});

//map에 레이어 추가 여부 확인 
var SEARCH_POI_INIT = false;	

//검색 요청
function fn_searchDB(){
	$.get('./getBusanAttData', fn_searchResHandler);
}

//검색 요청 콜백
function fn_searchResHandler(data){
	
	if(!SEARCH_POI_INIT){
		OL_MAP.addLayer(SEARCHPOI_LAYER);
		SEARCH_POI_INIT = true;
	}
	
	SEARCHPOI_SOURCE.clear();
	
	const resultList = data.res;
	
	let result = '';
	$('#searchres_db').empty();
	$('#tab3 h2').html('<span>부산관광지</span> 검색결과입니다.');
	for(let data of resultList){
	//resultList.foreach((data, idx) => {
		result += '<li class="title active" data-pointx=' + data.lng + ' data-pointy=' + data.lat + 
		' onclick="fn_getNearstMetro(\'' + data.gid  + '\')"><ul>';
		result += '<li>' + data.name + '</li>';
		result += '<li class="addr">' + data.addr1 + '</li>';
		result += '<li class="phone">' + data.title + '</li></li></ul>';
		$('#searchres_db').html(result);
		
		const iconFeature = new ol.Feature({
			geometry: new ol.geom.Point([data.lng, data.lat]),
			name: data.name
		});
		
		SEARCHPOI_SOURCE.addFeature(iconFeature);
	//});
	}
	
	OL_MAP.getView().fit(SEARCHPOI_SOURCE.getExtent(), OL_MAP.getSize());
	
}

//가까운 지하철역 검색
function fn_getNearstMetro(attId){
	
	const pJson = JSON.stringify({"attid": attId});
	$.ajax({
		type:'POST',
		url: './getNearstMetro',
		data: pJson,
		dataType: 'json',
		contentType: 'application/json; charset=UTF-8',
		success:function(data){
			
				if(!METRO_POI_INIT){
					OL_MAP.addLayer(METRO_LAYER);
					OL_MAP.addLayer(M_LIE_LAYER);
					METRO_POI_INIT = true;
				}
				
				resultList = data.res;
				METRO_SORURCE.clear();
				M_LINE_SOURCE.clear();
				
				for(let data of resultList){
					let iconFeature = new ol.Feature({
						geometry: new ol.geom.Point([data.st_x, data.st_y]),
						name: data.name
					});
					
					const lineFeature = new ol.Feature(new ol.geom.LineString([[data.lng, data.lat], [data.st_x, data.st_y]]));
					METRO_SORURCE.addFeature(iconFeature);
					M_LINE_SOURCE.addFeature(lineFeature);
				}
				OL_MAP.getView().fit(METRO_SORURCE.getExtent(), OL_MAP.getSize());
		},	
		error:function(request,status,error){
		            alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
		        }
	});
}

function fn_addMetroLoc(data){
	console.log('asd');
	console.log(data);
	if(!METRO_POI_INIT){
		OL_MAP.addLayer(METRO_LAYER);
		OL_MAP.addLayer(M_LIE_LAYER);
		METRO_POI_INIT = true;
	}
	
	resultList = data.res;
	METRO_SORURCE.clear();
	M_LINE_SOURCE.clear();
	
	for(let data of resultList){
		let iconFeature = new ol.Feature({
			geometry: new ol.geom.Point([data.st_lng, data.st_lat]),
			name: data.name
		});
		
		const lineFeature = new ol.Feature(new ol.geom.LineString([[data.lng, data.lat], [data.st_lng, data.st_lat]]));
		METRO_SORURCE.addFeature(iconFeature);
		M_LINE_SOURCE.addFeature(lineFeature);
	}
	OL_MAP.getView().fit(METRO_SORURCE.getExtent(), OL_MAP.getSize());
}

//지하철역 아이콘
const METRO_ICON = new ol.style.Style({
    image: new ol.style.Icon({
        anchor: [0.5, 46],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        src: './resources/img/metro.png',
    })
});

//벡터 소스 추가
const METRO_SORURCE = new ol.source.Vector({});	
//레이어에 벡터소스 추가
const METRO_LAYER = new ol.layer.Vector({
	name : 'METRO_LAYER',
	source: METRO_SORURCE,
	style: METRO_ICON
});

//line style 생성
const M_LINE_STYLE = new ol.style.Style({
  stroke : new ol.style.Stroke({
	  color : '#ffcc33',
	  width : 5
  })
});

const M_LINE_SOURCE = new ol.source.Vector({});
//백터 레이어 생성
const M_LIE_LAYER = new ol.layer.Vector({
  name : 'M_LIE_LAYER',
  source: M_LINE_SOURCE,
  style: M_LINE_STYLE
});

//map에 레이어 추가
var METRO_POI_INIT = false;	


//지하철역 위치 표현
function fn_addMetroLoc(data){
	
}



/**
 * ##실습 6. vworld api를 이용한 위치검색 함수 
 *  1) 키워드 위치 검색
 *  2) 검색 목록 별 POINT 생성
 *  3) 페이징 적용
 *  4) 검색 목록 클릭시 해당 위치로 이동
 * */


//vworld 위치 검색 api
function fn_searchVworld(pageNum){
	
	var keyword = $('#searchKeyword_vw').val();	//검색할 키워드
	
	if(keyword.trim().length == 0){ //검색결과 초기화
		$('#tab2 h2').html("");
		$('#searchres_vw').html('');
		$('#searchrpage_vw').html('');			
		return;
	}else{
		if(!SEARCH_POI_INIT){
			OL_MAP.addLayer(SEARCHPOI_LAYER); 		//측정 레이어 추가	
			SEARCH_POI_INIT = true;				//레이어 호출 여부 플레이그
		}
				//검색 아이콘 소스 클리어
		SEARCHPOI_SOURCE.clear();
	}	
		
	var params = {
	    service: "search"
	    , request: "search"
	    , version: "2.0"
	    , crs: "EPSG:4326"
	    , size: 10
	    , page: pageNum
	    , query: keyword
	    , type: 'PLACE'
	    , format: "json"
	    , errorformat: "json"		
	    , key: GLOBAL.VWORLD_API_KEY
	}	
		
	$.ajax({
	        type: 'GET'
	        , url: "http://api.vworld.kr/req/search"
	        , dataType: 'JSONP'
	        , data: params
	        , success: function (data) {
				//검색 결과 목록 배치
				$('#tab4 h2').html("<span>"+keyword+"</span>(총 "+data.response.record.total+"건) 검색결과입니다.");
				let result = '';
				//#클릭시 위치 이동 되도록 소스 추가 필요
				for(let i = 0; i<data.response.record.current; i++){
					let thisItem = data.response.result.items[i];
					result += '<li class="title active" data-pointx='+thisItem.point.x+' data-pointy='+thisItem.point.y+'  onclick="fn_showLocation(this)"><ul>'; 
					result += '<li>'+thisItem.title+'</li>';						//명칭
					result += '<li>'+thisItem.address.parcel+'</li>';				//지번주소
					result += '<li class="addr">'+thisItem.address.road+"</li>";    //도로명주소
					result += '<li class="phone">'+thisItem.id+'<span> | '+thisItem.category+'</span></li></ul></li>';
					result = fn_keywordHighlight(result, keyword);
					$('#searchres_vw').html(result);
					//#검색 결과 point 배치
					//검색결과의 위치를 아이콘으로 표현하는 소스 추가 필요
					//아이콘 feature 생성
					let iconFeature = new ol.Feature({
					//검색결과의 경위도 컬럼명인 point.x, point.y
					 	geometry: new ol.geom.Point([thisItem.point.x, thisItem.point.y]),
						 name: data.name //검색결과 명칭 이름 
					});
					
					//벡터소스에 feature add
					SEARCHPOI_SOURCE.addFeature(iconFeature);

				}

				//검색 결과 페이징 목록 배치
				let pageData = data.response.page;
				let pagination = ''; 
				let startPage = (parseInt((pageData.current-1)/10)*10)+1; //시작페이지
				let endPage = startPage+(pageData.size-1);				  //끝페이지

				if(pageData.current == '1'){
					pagination += '<li disabled>◀</li>';
				}else{
					pagination += '<li>◀</li>';
				}
				let maxPage = pageData.total < endPage ? pageData.total : endPage;
				for(let i = startPage; i<=maxPage; i++){
					if(pageData.current == i){
						pagination += "<li id='currnetPage' disabled>"+i+"</li>";
					}else{
						pagination += "<li>"+i+"</li>";
					}
				}
				if(pageData.current == pageData.total){
					pagination += '<li disabled>▶</li>';
				}else{
					pagination += '<li>▶</li>';
				}
				$('#searchrpage_vw').html(pagination);
				OL_MAP.getView().fit(SEARCHPOI_SOURCE.getExtent(), OL_MAP.getSize());
				OL_MAP.getView().setZoom(OL_MAP.getView().getZoom()-1);
	        }
	    })

}

//
function fn_showLocation(_obj){
	//Number로 형변환
	var lon = parseFloat($(_obj).attr("data-pointx")); 
	var lat = parseFloat($(_obj).attr("data-pointy")); 

	//지정한 좌표를 중심으로 이동
	
	var ol_camera = OL_MAP.getView();
	ol_camera.setCenter([lon, lat]);
	ol_camera.setZoom(18);
}

//검색어 하이라이트
function fn_keywordHighlight(_html, _keyword) {
    // 검색어에 해당하는 부분을 강조
 	 const highlightedText = _html.replace(
    	new RegExp(`(${_keyword})`, "gi"),
    	'<span class="keyword_highlight">$1</span>'
  		);
      return highlightedText;
}

//################################################################################ 레이어 매시업
function fn_addWmsLayer(_flag, _layerNm, _type){
	var wms_layer = "";
	
	if(fn_findLayerByName(_layerNm)){
		wms_layer = fn_findLayerByName(_layerNm);
		wms_layer.setVisible(_flag);
		return;
	}
	
	if(_flag){
		if(_type == 'geoserver'){
			wms_layer = new ol.layer.Tile({
					name: _layerNm,
					extent: [124.57849539297766, 32.56623775540233, 129.97428592822916, 39.22393370585444],
					source: new ol.source.TileWMS(
					{
						url: GLOBAL.GEOSERVER_WMS_URL,
						params: {
							'LAYERS': _layerNm,
							'TILED': true
						},
						transition: 0
						}) // end source
					});
					
		}else if(_type = 'vworld'){
			wms_layer = new ol.layer.Tile({
				name: _layerNm,
				extent: [124.57849539297766, 32.56623775540233, 129.97428592822916, 39.22393370585444],
				source: new ol.source.TileWMS({
					url: GLOBAL.VWORLD_WMS_URL,
					param: {
						'KEY' : GLOBAL.VWORLD_API_KEY,
						'DOMAIN' : 'localhost',
						'LAYERS': _layerNm,
						'TILED': true
					},
					transition: 0
				})
			});		
		}
	}
	
	OL_MAP.addLayer(wms_layer);
	
	
}

// 레이어 이름으로 해당 레이어가 있는지 확인하는 함수
function fn_findLayerByName(layerName) {
	const layers = OL_MAP.getLayers().getArray();
	return layers.find(layer => layer.get('name') == layerName);
}



//################################################################################ 인터렉션

//기본 스타일 지정
var DRAW_STYLE = new ol.style.Style({
				fill: new ol.style.Fill({
					color: 'rgba(0, 100, 50, 0.5)'
				}),
				stroke: new ol.style.Stroke({
					color: 'rgba(150, 0, 0, 0.5)',
					lineDash: [10, 10],
					width: 2
				}),
				image: new ol.style.Circle({
					radius: 5,
					stroke: new ol.style.Stroke({
						color: 'rgba(0, 0, 150, 0.7)'
					}),
					fill: new ol.style.Fill({
						color: 'rgba(100, 100, 255, 0.5)'
					})
				})
			});
			
var DRAW_SORUCE = new ol.source.Vector();	//측정 레이어 소스
var DRAW_LAYER  = new ol.layer.Vector({	//측정 레이어
	name : 'DRAW_LAYER',
	source : DRAW_SORUCE,
	style  : DRAW_STYLE
});

var DRAW_LAYER_INIT = false;					//레이어 추가 여부
var MEA_DRAW; 	

const MEASURE_OVERLAY = new ol.Overlay({
		  element: document.getElementById('measurement'), // 결과를 표시할 HTML 요소
		  positioning: 'bottom-center',
		  stopEvent: false,
		});
		
			
//##실습 5. 기본 객체 관리
// 1)기본 객체 생성(포인트, 라인, 폴리곤)
//메뉴 선택 -> 클릭 후 객체 생성 -> 마우스 지도 이동 모드로 자동변경 
//삭제모드 -> 마우스 클릭시 객체 삭제 and 객체 전체 삭제 					//측정 인터렉션
var fn_setDrawInterection = function(_type, _flag){		//측정 인터렉션 생성

}
//전체 객체 삭제
function fn_removeDrawInteraction(){				//초기화
	
}
// 지도 위에 측정 결과 표시 함수
function fn_showMeasurementOnMap(_geometry) {
 
}

//#측정 기능 구현
function fn_calculateMeasurement(_geometry){

}



