<?php 

$name = $_POST['name'];
$email = $_POST['email'];
$subject = $_POST['subject'];
$msg = $_POST['msg'];
 
$to = 'f.torghele@gmail.com';
$message = 'FROM: '.$name.' Email: '.$email.' Message: '.$msg;
$headers = 'From: noreply@torghele.at' . "\r\n";

if (empty($name)) {
	echo "no_name";
} else if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
	echo "no_mail";
} else if (empty($subject)) {
	echo "no_subject";
} else if (empty($msg)) {
	echo "no_message";
} else {
	mail($to, $subject, $message, $headers);
	echo "success";
}
