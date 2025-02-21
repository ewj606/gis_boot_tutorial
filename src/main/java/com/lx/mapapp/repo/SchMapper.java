package com.lx.mapapp.repo;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface SchMapper {
	List<Map<String, Object>> getAttData();

	List<Map<String, Object>> getNearstMetro(Map<String, Object> param);
}
