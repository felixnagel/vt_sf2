<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use AppBundle\Entity\Times;

class DefaultController extends Controller{
    protected function _set_current_map($map_id){
        if(!is_numeric($map_id)){
            $sMapId = serialize($map_id);
            throw new \Exception(sprintf(
                'No numeric value given for iMapId! | user_id[%s], map_id[%s]', $iUserId, $sMapId
            ));
        }
        $iMapId = (int)$map_id;
        $this->get('session')->set('current_map', $iMapId);
    }
    protected function _get_current_map_id_from_session(){
        return $this->get('session')->get('current_map');
    }
    protected function _get_user_id_from_session(){
        return $this->get('security.token_storage')->getToken()->getUser()->getId();
    }
    protected function _get_map($iMapId){
        $oMap = $this->getDoctrine()->getRepository('AppBundle:Map')->findOneBy([
            'id' => $iMapId,
        ]);
        if(!$oMap){
            throw new \Exception(sprintf(
                'No map to load could be found in DB! | map_id[%s]', $iMapId
            ));
        }

        return $oMap;
    }
    protected function _get_player_time($iMapId, $iUserId){
        $iUserId = $this->_get_user_id_from_session();
        $iMapId = $this->_get_current_map_id_from_session();

        $oTimes = $this->getDoctrine()->getRepository('AppBundle:Times')->findOneBy([
            'mapId' => $iMapId,
            'playerId' => $iUserId,
        ]);
        if(!$oTimes){
            $oTimes = new Times();
            $oTimes->setPlayerId($iUserId);
            $oTimes->setMapId($iMapId);
        }
        return $oTimes;
    }
    protected function _get_map_times($iMapId){
        $aTimes = $this->getDoctrine()->getRepository('AppBundle:Times')->findBy(
            ['mapId' => $iMapId], ['finishTime' => 'ASC']
        );
        return $aTimes;
    }
    protected function _get_map_record($iMapId){
        return $this->_get_map_times($iMapId)[0];
    }
    protected function _get_player_map_rank($iMapId, $iUserId){
        $oPlayerTime = $this->_get_player_time($iMapId, $iUserId);
        if(!$oPlayerTime->getFinishTime()){
            return false;
        }
        
        $criteria = new \Doctrine\Common\Collections\Criteria();
        $criteria->where($criteria::expr()->lt('finishTime', $oPlayerTime->getFinishTime()));

        $result = $this->getDoctrine()->getRepository('AppBundle:Times')->matching($criteria);

        dump($result);

        return $result;
    }


    /*
    protected function _store_times(){
        $iUserId = $this->_get_user_id_from_session();
        $iMapId = $this->_get_current_map_id_from_session();

        $oTimes = $this->getDoctrine()->getRepository('AppBundle:Times')->findOneBy([
            'mapId' => $iMapId,
            'playerId' => $iUserId,
        ]);
        if(!$oTimes){
            return [];
        }
        return $oTimes->getCheckpointTimes();
    }
    */
}
