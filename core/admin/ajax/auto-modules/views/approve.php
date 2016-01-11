<?php
	include "_setup.php";
	
	if ($item["approved"]) {
		if ($access_level != "p") {
			echo 'BigTree.growl("'.$module["name"].'","You don\'t have permission to perform this action.");';
		} else {
			echo 'BigTree.growl("'.$module["name"].'","Item is now unapproved.");';
			if (is_numeric($id)) {
				$db->update($table,$id,array("approved" => ""));
			} else {
				BigTreeAutoModule::updatePendingItemField(substr($id,1),"approved","");
			}
		}
	} else {
		if ($access_level != "p") {
			echo 'BigTree.growl("'.$module["name"].'","You don\'t have permission to perform this action.");';
		} else {
			echo 'BigTree.growl("'.$module["name"].'","Item is now approved.");';
			if (is_numeric($id)) {
				$db->update($table,$id,array("approved" => "on"));
			} else {
				BigTreeAutoModule::updatePendingItemField(substr($id,1),"approved","on");
			}
		}
	}
	
	include "_recache.php";