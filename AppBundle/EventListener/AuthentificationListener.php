<?php

namespace AppBundle\EventListener;

use AppBundle\Controller\AuthentificatedController;
use Symfony\Component\HttpKernel\Event\FilterControllerEvent;

class AuthentificationListener{
	public function onKernelController(FilterControllerEvent $oEvent){
		$oController = $oEvent->getController();

		// logged in?
		if($oController[0] instanceof AuthentificatedController){

		}
	}
}
