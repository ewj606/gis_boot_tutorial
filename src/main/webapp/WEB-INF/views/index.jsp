<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<!-- 템플릿-->
<link rel="stylesheet" href="resources/css/kict.css" type="text/css">
<link rel="stylesheet" href="resources/css/core.css" type="text/css">
<link rel="stylesheet" href="resources/css/img_input.css" type="text/css">
<link rel="stylesheet" href="resources/css/jquery.mCustomScrollbar.min.css" type="text/css">
<script src="resources/js/lib/jquery-1.8.3.js" type="text/javascript"></script>
<script src="resources/js/lib/jquery-ui-1.9.2.custom.min.js"></script>
<script src="resources/js/lib/ul_ctrl.js" type="text/javascript"></script>
<script src="resources/js/lib/jquery.mCustomScrollbar.min.js" type="text/javascript"></script>

<script src="https://cdn.jsdelivr.net/npm/ol@v7.4.0/dist/ol.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ol@v7.4.0/ol.css">

<!-- openlayers cdn import #실습 -->


<title>OPEN SOURCE GIS SERVICE</title>
</head>
<body>
<!-- 지도 표출 영역 -->
<div class="xd_container" id="mapcontainer"></div>
<div class="map_wrap"><!-- css에 background: url("../img/map_view.png"); 삭제 미리보기용 배경 -->	
	<div class="top_wrap"> 
	<h1>지도서비스</h1>		
	</div>
	<!-- 왼쪽 메인 메뉴-->
	<div class="navi">
		<ul id="right_tab_btn">
			<li class="m_1 active" id="t_map">지도</li>
			<li class="m_2" id="t_search">검색</li>
			<li class="m_4" id="t_drawobj">인터렉션</li>
			<li class="m_3" id="t_infra">레이어관리</li>			
			<!-- <li class="m_5" id="t_algorithm">현실정보</li>
			<li id="t_analysis">분석</li> -->
		</ul>
	</div>
	<!-- 메뉴 컨텐츠-->
	<div class="contents">		
		<div class="rightTab" id="d_map">
			<ul class="tabs">
				<li rel="tab1" class="active firstmenu">지도호출</li>
				<li rel="tab2">카메라</li>														
			</ul>
			<div class="tab_container">		
				<div id="tab1" class="tab_content">		
					<div class="sub2_container js_scroll">						
						<h3>OpenLayers 지도 호출</h3>
						<button class="btn_1" onclick="fn_callOLMap()">지도호출</button>
					</div>
				</div>			
				<div id="tab2" class="tab_content">						
					<div class="sub2_container js_scroll">							
						<h3>좌표로 카메라 이동</h3>
						<ul class="map_base">
							<li>									
								<span class="s_title">경도</span>
								<input type="text" class="search_txt" id="camLon" placeholder="입력해주세요" value="127.1">
							</li>
							<li>									
								<span class="s_title">위도</span>
								<input type="text" class="search_txt" id="camLat" placeholder="입력해주세요" value="37.5">
							</li>	
						</ul>
						<button class="btn_1" onclick="fn_moveCamera()">위치 이동</button>
						<h3>클릭지점 좌표</h3>
						<ul class="underground_Facility">
							<li>
								<span class="color_legend" style="background: #ffff96"></span>
								클릭지점 좌표 이벤트
								<label class="input_switch fl_r">
									<input type="checkbox" onchange="fn_evtRegister(this.checked)">
									<span class="input_slider round"></span>
								</label>
							</li>
							<li>	
								<span class="color_legend" style="background: #ffff"></span>
								경도				
								<input type="text" class="search_txt" id="evntLon" placeholder="입력해주세요" >
							</li>
							<li>		
								<span class="color_legend" style="background: #ffff"></span>
								위도				
								<input type="text" class="search_txt" id="evntLat" placeholder="입력해주세요" >
							</li>
							<!-- <li>									
								<span class="s_title">높이</span>
								<input type="text" class="search_txt" id="evntAlt" placeholder="입력해주세요">
							</li>								  -->
						</ul>		
						<h3>클릭지점 좌표 지오코딩</h3>
						<ul class="underground_Facility">
							<li>
								<span class="s_title" id="geocoding_res"></span>									
							</li>						
						</ul>												
					</div>
				</div >			
			</div>
		</div>
		<!-- ★★★★★★대메뉴2_검색 ★★★★★★ -->
		<div class="rightTab hide" id="d_search">						
			<!-- 탭시작 -->
			<div id="container">
				<ul class="tabs_2">
					<li rel="tab3" class="active firstmenu">관광지검색</li>
					<li rel="tab4">브이월드검색</li>														
				</ul>
				<div class="tab_container">										
					<div id="tab3" class="tab_content_2">
						<span class="search">
							<input id="searchKeyword_db" type="text" placeholder="검색어를 입력해 주세요">
							<button onclick="fn_searchDB(1);" id="search_btn_db">검색</button>
						</span>
						<h2></h2>
						<div class="search_list js_scroll">
							<ul id="searchres_db" class="s_location">
								<!-- DB검색 결과 -->														 	
							</ul>
						</div>
						<div class="s_paging_wrap">
							<ul id="searchrpage_db" class="s_paging">
								
							</ul>
						</div>
					</div >
					<div id="tab4" class="tab_content_2">						
						<span class="search">
							<input id="searchKeyword_vw" type="text" placeholder="검색어를 입력해 주세요">
							<button onclick="fn_searchVworld(1);" id="search_btn_vw">검색</button>
						</span>
						<h2></h2>
						<div class="search_list js_scroll">
							<!-- vworld 검색 결과 -->
							<ul id="searchres_vw"  class="s_location">
								<!-- 위치검색 결과 반복_1~10개까지 그이후 다음페이지 -->
														 	
							</ul>
						</div>
						<div class="s_paging_wrap">
							<ul id="searchrpage_vw" class="s_paging">								
							</ul>
						</div>
					</div>					
				</div>
				<!-- .tab_container -->
			</div>
			<!-- #container -->
		</div>
		<!-- ★★★★★★대메뉴4_베이스맵★★★★★★ -->
		<div class="rightTab hide" id="d_drawobj">
			<div id="container">
				<ul class="tabs_3">
					<li rel="tab5" class="active firstmenu">기본객체관리</li>
					<li rel="tab6">면적측정</li>
				</ul>
				<div class="tab_container">
					<div id="tab5" class="tab_content_3 js_scroll">
						<div class="sub2_container js_scroll">
							<h3>객체 그리기</h3>
								<button class="btn_2" onclick="fn_setDrawInterection('Point')">Point 그리기</button>					
								<button class="btn_2" onclick="fn_setDrawInterection('LineString')">LineString 그리기</button>					
								<button class="btn_2" onclick="fn_setDrawInterection('Polygon')">Polygon 그리기</button>
								<button class="btn_2" onclick="fn_setDrawInterection('Move')">이동모드</button>
								<button class="btn_1" onclick="fn_removeDrawInteraction()">그리기 객체 전체 삭제</button>					
						</div>
					</div>
					<div id="tab6" class="tab_content_3 js_scroll hide">
						<div class="sub2_container js_scroll">
							<h3>측정</h3>
							<button class="btn_2" onclick="fn_setDrawInterection('LineString',true)">거리측정</button>					
							<button class="btn_2" onclick="fn_setDrawInterection('Polygon', true)">면적측정정</button>		
							<button class="btn_1" onclick="fn_setDrawInterection('Move')">이동모드</button>		
							<button class="btn_1" onclick="fn_removeDrawInteraction()">측정 내용 전체 삭제</button>					
						</div>
					</div>
				</div>
			</div>
		</div>
		<!-- ★★★★★★대메뉴3_건물★★★★★★ -->
		<div class="rightTab hide" id="d_infra">			
			<h1>
				<span>레이어 관리</span>
			</h1>
			<div class="sub3_container js_scroll">
				<h3>WMS 레이어 _ 브이월드</h3>
				<ul class="underground_Facility">
					<li>
						<span class="color_legend" style="background: #43cf43"></span>
						광역시도
						<label class="input_switch fl_r">
							<input type="checkbox" onchange="fn_addWmsLayer(this.checked, this.id,'vworld')" id="lt_c_adsido">
							<span class="input_slider round"></span>
						</label>
					</li>				
					<li>
						<span class="color_legend" style="background: #43cf43"></span>
						시군구
						<label class="input_switch fl_r">
							<input type="checkbox" onchange="fn_addWmsLayer(this.checked, this.id,'vworld')" id="lt_c_adsigg">
							<span class="input_slider round"></span>
						</label>
					</li>				
					<li>
						<span class="color_legend" style="background: #43cf43"></span>
						읍면동동
						<label class="input_switch fl_r">
							<input type="checkbox" onchange="fn_addWmsLayer(this.checked, this.id,'vworld')" id="lt_c_ademd">
							<span class="input_slider round"></span>
						</label>
					</li>				
				</ul>
				<h3>WFS 레이어 _ DB</h3>
				<ul class="underground_Facility">
					<li>
						<span class="color_legend" style="background: #ffff"></span>
						부산1호선노선도
						<label class="input_switch fl_r">
							<input type="checkbox" onchange="fn_addWmsLayer(this.checked, this.id,'geoserver')" id="lxsp:busan_line1">
							<span class="input_slider round"></span>
						</label>
					</li>	
					<li>
						<span class="color_legend" style="background: #ffff"></span>
						부산1호선버퍼
						<label class="input_switch fl_r">
							<input type="checkbox" onchange="fn_addWmsLayer(this.checked, this.id,'geoserver')" id="lxsp:busan_metro_buffer">
							<span class="input_slider round"></span>
						</label>
					</li>					
				</ul>
			</div>
		</div>
	</div>
</div>
<div id="measurement" class='measurement' style="display: none;"></div>
<script src="resources/js/main_op_before.js"></script>

<script>
	
	(function($){
		$(window).on("load",function(){
			
			$(".js_scroll").mCustomScrollbar({
				//setHeight:170,
				theme:"minimal-dark"
			});
		});
	})(jQuery);
	
</script>

</body>
</html>
