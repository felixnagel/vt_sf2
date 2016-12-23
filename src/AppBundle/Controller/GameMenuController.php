<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use LuckyNail\SimpleForms\Form;

class GameMenuController extends Controller implements AuthentificatedController{
	/**
     * @Route("/game", name="game_menu")
     */
    public function indexAction(){
        return $this->render('default/game_menu.html.twig', []);
    }
}
