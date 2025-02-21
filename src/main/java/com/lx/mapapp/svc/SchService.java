package com.lx.mapapp.svc;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lx.mapapp.repo.SchMapper;

@Service
public class SchService {
	
	@Autowired
	private SchMapper schMapper;
	
	public List<Map<String, Object>> getAttData(){
		return schMapper.getAttData();
	}
	
	public List<Map<String, Object>> getNearstMetro(Map<String, Object> param){
		return schMapper.getNearstMetro(param);
	}
	
}
