<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use AppBundle\Entity\Map;
use AppBundle\Entity\Times;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Bundle\FrameworkBundle\DependencyInjection\Configuration;

class ValidateController extends DefaultController implements AuthentificatedController{
    /**
     * @Route("/validate/map/{map_id}", name="validate/map")
     */
    public function validateAction($map_id){
        $iUserId = $this->get('security.token_storage')->getToken()->getUser()->getId();
        $this->_set_current_map($map_id);

        $aTplData = [
            'aC_blocks' => $this->container->getParameter('app.blocks'),
            'aC_dirs' => $this->container->getParameter('app.base_urls'),
            'aC_map' => $this->container->getParameter('app.map'),
            'aC_ship' => $this->container->getParameter('app.ship'),
            'aC_spritesheets' => $this->container->getParameter('app.spritesheets'),
        ];

        return $this->render('race/validate.html.twig', $aTplData);
    }
    /**
     * @Route("/validate/submit", name="validate/submit")
     */
    public function submitTimesAction(Request $request){
        $iUserId = $this->get('security.token_storage')->getToken()->getUser()->getId();
        $iMapId = $this->_get_current_map();

        $oMap = $this->_load_map($iMapId);
        if($oMap->getCreatedBy() != $iUserId){
            throw new \Exception(sprintf(
                'Map createdBy differs from iUserId! | user_id[%s], map_id[%s]', $iUserId, $oMap->getId()
            ));
        }
        if($oMap->getReleasedAt() !== null){
            throw new \Exception(sprintf(
                'Map was already released! | user_id[%s], map_id[%s]', $iUserId, $oMap->getId()
            ));
        }

        $times = $request->get('t');
        if(!is_string($times) || !$times){
            $sTimes = serialize($times);
            throw new \Exception(sprintf(
                'Corrupt times string t given! | user_id[%s], map_id[%s], t[%s]', $iUserId, $oMap->getId(), $sTimes
            ));
        }
        $sTimes = $times;

        $oTimes = $this->_get_times();
        $bIsImprovement = $oTimes->update_times($sTimes);

        if($bIsImprovement){
            $oEm = $this->getDoctrine()->getManager();
            $oEm->persist($oTimes);
            $oEm->flush();
        }
        return new Response;
    }
    /**
     * @Route("/validate/load", name="validate/load")
     */
    public function loadAction(){
        $iUserId = $this->get('security.token_storage')->getToken()->getUser()->getId();

        $oMap = $this->_load_map();

        if($oMap->getCreatedBy() != $iUserId){
            throw new \Exception(sprintf(
                'Map createdBy differs from iUserId! | user_id[%s], map_id[%s]', $iUserId, $oMap->getId()
            ));
        }
        if($oMap->getReleasedAt() !== null){
            throw new \Exception(sprintf(
                'Map was already released! | user_id[%s], map_id[%s]', $iUserId, $oMap->getId()
            ));
        }

        return new JsonResponse($oMap->getBlocks());
    }




}
