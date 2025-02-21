package com.lx.mapapp.cont;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;


@Controller
public class MapController {

	
	@GetMapping("/")
	public String map() throws Exception {
		return "index";
	}
	
}
