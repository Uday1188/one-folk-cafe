package com.friendscafe;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class HashTest {
    @Test
    public void printHash() {
        System.out.println("BCRYPT_HASH_RESULT=" + new BCryptPasswordEncoder().encode("cafeadmin@1122"));
    }
}
