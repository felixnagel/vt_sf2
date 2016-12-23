<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class LuckyController extends Controller{
    
	/**
     * @Route("/test/{number}", name="test")
     */
    public function numberAction($number){
        return $this->render(
            'lucky/number.html.twig',
            array('luckyNumberList' => $number)
        );
    }
}
