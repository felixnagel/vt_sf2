<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

class DefaultController extends Controller{
    protected function _load_map($map_id){
        if(!is_numeric($map_id)){
            $sMapId = serialize($map_id);
            throw new \Exception(sprintf(
                'No numeric value given for iMapId! | map_id[%s]', $sMapId
            ));
        }
        $iMapId = (int)$map_id;

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
}
