<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use AppBundle\Controller\AuthentificatedController;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class MapsController extends Controller implements AuthentificatedController{
	
	/**
     * @Route("/maps", name="showMaps")
     */
	public function showMapsAction(){
		var_dump('showMapsAction');

        return $this->render(
            'lucky/number.html.twig',
            array('luckyNumberList' => 5)
        );
	}
}
