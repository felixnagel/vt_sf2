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
        $this->_set_current_map($map_id);
        
        $iUserId = $this->_get_user_id_from_session();
        $iMapId = $this->_get_current_map_id_from_session();

        $aTplData = [
            'aC_blocks' => $this->container->getParameter('app.blocks'),
            'aC_dirs' => $this->container->getParameter('app.base_urls'),
            'aC_map' => $this->container->getParameter('app.map'),
            'aC_ship' => $this->container->getParameter('app.ship'),
            'aC_spritesheets' => $this->container->getParameter('app.spritesheets'),
            'aTimes' => $this->_get_player_time($iMapId, $iUserId)->getCheckpointTimes(),
        ];

        //return $this->render('race/validate.html.twig', $aTplData);
        return $this->render('race/race.html.twig', $aTplData);
    }
    /**
     * @Route("/validate/submit", name="validate/submit")
     */
    public function submitTimesAction(Request $request){
        $iUserId = $this->_get_user_id_from_session();
        $iMapId = $this->_get_current_map_id_from_session();

        $oMap = $this->_get_map($iMapId);
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

        $times = $request->get('aTimes');
        if(!is_array($times) || !$times){
            $sTimes = serialize($times);
            throw new \Exception(sprintf(
                'Corrupt times string t given! | user_id[%s], map_id[%s], t[%s]', $iUserId, $oMap->getId(), $sTimes
            ));
        }
        $aTimes = $times;
        $iFinishTime = $aTimes[count($aTimes)-1];

        $oTimes = $this->_get_player_time($iMapId, $iUserId);
        $aOldCheckpointTimes = $oTimes->getCheckpointTimes();

        if(!$aOldCheckpointTimes || $oTimes->getFinishTime() > $iFinishTime){
            $oTimes->setCheckpointTimes($aTimes);
            $oTimes->setFinishTime($iFinishTime);

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
        $iUserId = $this->_get_user_id_from_session();
        $iMapId = $this->_get_current_map_id_from_session();

        $oMap = $this->_get_map($iMapId);

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
    /**
     * @Route("/validate/scoreboard", name="validate/scoreboard")
     */
    public function showScoreboardAction(){
        $iUserId = $this->_get_user_id_from_session();
        $iMapId = $this->_get_current_map_id_from_session();
        $oMap = $this->_get_map($iMapId);

        // Map Creator
        $oMapCreator = $this->getDoctrine()->getRepository('AppBundle:Users')->findOneBy([
            'id' => $oMap->getCreatedBy(),
        ]);
        if(!$oMapCreator){
            throw new \Exception(sprintf(
                'No map creator could be found in DB! | player_id[%s]', $oMap->getCreatedBy()
            ));
        }

        // Global Best Time
        $oGlobalBest = $this->_get_map_record($iMapId);

        // Personal Best
        $oPlayerTime = $this->_get_player_time($iMapId, $iUserId);

        // Map Times
        $aMapTimes = $this->_get_map_times($iMapId);

        $aPlayerRank = $this->_get_player_map_rank($iMapId, $iUserId);


        dump($oMapCreator);
        dump($oGlobalBest);
        dump($oPlayerTime);
        dump($aMapTimes);
        dump($aPlayerRank);


        $aTplData = [
            'sCreatedBy' => $oMapCreator->getUsername(),
            'sGlobalBest' => $oGlobalBest->getFinishTime(),
            'sPersonalBest' => $oPlayerTime->getFinishTime(),
        ];

        return $this->render('race/scoreboard.html.twig', $aTplData);
    }




}
