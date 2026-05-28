package com.apollopet.adotei.backend;

import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;

@SpringBootTest
class AdoteiBackendApplicationTests {

    private final ApplicationContext context;

    AdoteiBackendApplicationTests(ApplicationContext context) {
        this.context = context;
    }

    @Test
    void contextLoads() {
        assertNotNull(context);
    }
}
