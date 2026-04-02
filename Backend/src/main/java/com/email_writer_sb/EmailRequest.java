package com.email_writer_sb;


import lombok.Data;

@Data
public class EmailRequest {
    private String emailContent;
    private String tone;
}
