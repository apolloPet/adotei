package com.apollopet.adotei.backend.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.bootstrap.admin")
public class AdminBootstrapProperties {

    private boolean enabled = false;
    private String authSubject = "admin@petmatch.com";
    private String fullName = "Administrador Principal";
    private String email = "admin@petmatch.com";
    private String password = "admin123";

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getAuthSubject() {
        return authSubject;
    }

    public void setAuthSubject(String authSubject) {
        this.authSubject = authSubject;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
