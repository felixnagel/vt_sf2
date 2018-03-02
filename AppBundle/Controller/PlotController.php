<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Bundle\FrameworkBundle\DependencyInjection\Configuration;

class PlotController extends DefaultController implements AuthentificatedController{
    /**
     * @Route("/plot", name="/plot")
     */
    public function plotAction(){
        $iUserId = $this->get('security.token_storage')->getToken()->getUser()->getId();
        

        $aTplData = [
            'aC_blocks' => $this->container->getParameter('app.blocks'),
            'aC_map' => $this->container->getParameter('app.map'),
        ];

        return $this->render('map/plot.html.twig', $aTplData);
    }
}
