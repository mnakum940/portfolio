<?php

  //Import PHPMailer classes into the global namespace
//These must be at the top of your script, not inside a function
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

if(isset($_POST['send'])){

  $name = $_POST['fullname'];
  $email = $_POST['email'];
  $msg = $_POST['message'];


//Load Composer's autoloader
require 'PHPMailer/Exception.php';
require 'PHPMailer/PHPMailer.php';
require 'PHPMailer/SMTP.php';

//Create an instance; passing `true` enables exceptions
$mail = new PHPMailer(true);

try {
    //Server settings
    $mail->isSMTP();                                            //Send using SMTP
    $mail->Host       = 'smtp.gmail.com';                     //Set the SMTP server to send through
    $mail->SMTPAuth   = true;                                   //Enable SMTP authentication
    $mail->Username   = 'mnakum940@gmail.com';                     //SMTP username
    $mail->Password   = 'oumfwinwfarjfjiw';                               //SMTP password
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;            //Enable implicit TLS encryption
    $mail->Port       = 465;                                    //TCP port to connect to; use 587 if you have set `SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS`

    //Recipients
    $mail->setFrom('mnakum940@gmail.com', 'Contact Form');
    $mail->addAddress('neelborad00@gmail.com', 'Portfolio');     //Add a recipient


    //Content
    $mail->isHTML(true);                                  //Set email format to HTML
    $mail->Subject = 'Contact Form from portfolio';
    $mail->Body    = "Sender Name - $name <br> Sender Email - $email <br> Massage - $msg";

    $mail->send();
    echo "<div class='success'>Message has been sent!</div>";
} catch (Exception $e) {
    echo "<div class='alert'>Message could not be sent.</div>";
}


}

?>