package com.github.dba.repo.read;

import com.github.dba.model.DepGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DepGroupReadRepository extends JpaRepository<DepGroup, Long> {

    @Query("select d from dep_groups d where d.groupShort = :groupShort")
    DepGroup findByGroupShort(@Param("groupShort") String groupShort);

}
