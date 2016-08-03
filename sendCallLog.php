<?php
	require "vendor/phpmailer/phpmailer/PHPMailerAutoload.php";
	$email = "noreply@email.com";
	$name = "Se-Wy-Co Call Log Form";
	$sendto = "test@email.com";
	$sendto_name = "Test User";

	$postData = json_decode(file_get_contents("php://input"));
	$callType = $postData->callType;
	$callLoc = $postData->callLoc;
	$callComm = $postData->callComm;
	$callDate = $postData->callDate;
	$apps = $postData->apps;

	$subject = "Call Log: $callType @ $callLoc";
	$altMessage = "---Se-Wy-Co Call Log---\n";
	$altMessage .= "Date: $callDate";
	$altMessage .= "Call Type: $callType\n";
	$altMessage .= "Location: $callLoc\n";
	$altMessage .= "Comments: $callComm\n===========================================\n";
	$message = '<html><body><h1>Se-Wy-Co Call Log</h1><p><table>';
	$message .= "<tr><td>Call Date:<td><td>$callDate</td></tr>";
	$message .= "<tr><td>Call Type:<td><td>$callType</td></tr>";
	$message .= "<tr><td>Location:<td><td>$callLoc</td></tr>";
	$message .= "<tr><td>Comments:<td><td>$callComm</td></tr>";
	$message .= "<tr><td><hr></hr></td></tr>";
	for($i = 0; $i < sizeof($apps); $i++){
		$appName = $apps[$i]->name;
		$altMessage .= "-$appName-\n";
		$message .= "<tr><td><h3>$appName</h3></td></tr>";
		for($x = 0; $x < sizeof($apps[$i]->seatInfo); $x++){
			$sName = $apps[$i]->seatInfo[$x];
			if($sName == null){
				continue;
			}
			$message .= "<tr><td>";
			if($apps[$i]->seats > 0){
				if($x == 0){
					$altMessage .= "Driver: ";
					$message .= "<b>Driver:</b> ";
				}
				if($x == 1){
					$altMessage .= "Officer: ";
					$message .= "<b>Officer:</b> ";
				}
			}
			$altMessage .= "$sName\n";
			$message .= "$sName</td></tr>";
		}
		$altMessage .= "===========================================\n";
		$message .= "<tr><td><hr></hr></td></tr>";
	}
	$message .= '</table></body></html>';

	date_default_timezone_set('Etc/UTC');
	$mail = new PHPMailer;

	$mail->setFrom($email);
	$mail->addReplyTo($email, $name);
	$mail->addAddress($sendto, $sendto_name);

	$mail->WordWrap = 50;
	$mail->isHTML(true);

	$mail->Subject = $subject;
	$mail->Body = $message;
	$mail->AltBody = $altMessage;

	if(!$mail->send()){
		error_log($mail->ErrorInfo);
		$output = json_encode(array('status'=>false, 'msg' => 'Could not send mail!'));
		echo $output;
	}else{
		$output = json_encode(array('status'=>true, 'msg' => 'Email Sent', 'emailData' => $message));
		echo $output;
	}
?>
